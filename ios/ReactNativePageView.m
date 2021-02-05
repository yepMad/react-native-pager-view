
#import "ReactNativePageView.h"

@interface ReactNativePageView () <UIPageViewControllerDataSource, UIPageViewControllerDelegate, UIScrollViewDelegate>

@property(nonatomic, strong) NSMapTable<UIView *, UIViewController *> *controllerCache;
@property NSInteger currentPage;
@property(nonatomic, strong) NSMapTable<UIViewController *, NSNumber *> *pageIndexes;
@property(nonatomic, strong) UIPageViewController *reactPageViewController;

@property(nonatomic, weak) UIScrollView *scrollView;

@end

@implementation ReactNativePageView {
    uint16_t _coalescingKey;
}

- (instancetype)initWithEventDispatcher:(RCTEventDispatcher *)eventDispatcher {
    if (self = [super init]) {
        _controllerCache = [NSMapTable weakToWeakObjectsMapTable];
        _currentPage = 0;
        _scrollEnabled = true;
        _transitionStyle = UIPageViewControllerTransitionStyleScroll;
        _orientation = UIPageViewControllerNavigationOrientationHorizontal;
        _pageIndexes = [NSMapTable weakToStrongObjectsMapTable];
        [self embed];
    }
    return self;
}

- (void)didUpdateReactSubviews {
    [self goTo:self.currentPage animated:false];
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    if (
        [changedProps containsObject:@"orientation"]
        || [changedProps containsObject:@"transitionStyle"]) {
        [self embed];
        [self goTo:self.currentPage animated:false];
    } else if ([changedProps containsObject:@"scrollEnabled"]) {
        if (self.scrollView) {
            self.scrollView.scrollEnabled = self.scrollEnabled;
        }
    }
}

- (void)embed {
    if (self.reactPageViewController) {
        if (
            self.reactPageViewController.navigationOrientation == self.orientation
            && self.reactPageViewController.transitionStyle == self.transitionStyle) {
            // No change needed.
            return;
        }
        // Need to reinitialize.
        [self.reactPageViewController removeFromParentViewController];
        for (UIView *key in self.controllerCache) {
            [self.controllerCache objectForKey:key].view = nil;
        }
        [self.controllerCache removeAllObjects];
    }

    self.reactPageViewController = [[UIPageViewController alloc] initWithTransitionStyle:self.transitionStyle
                                                                   navigationOrientation:self.orientation
                                                                                 options:nil];
    self.reactPageViewController.dataSource = self;
    self.reactPageViewController.delegate = self;
    [self addSubview:self.reactPageViewController.view];

    for (UIView *subview in self.reactPageViewController.view.subviews) {
        if([subview isKindOfClass:UIScrollView.class]) {
            self.scrollView = (UIScrollView *)subview;
            self.scrollView.delegate = self;
            self.scrollView.scrollEnabled = self.scrollEnabled;
            break;
        }
    }
}

- (void)goTo:(NSInteger)index animated:(BOOL)animated {
    UIViewController *controller = [self getControllerAtPosition:index];
    if (!controller) {
        return;
    }

    __weak ReactNativePageView *weakSelf = self;
    [self.reactPageViewController setViewControllers:@[controller]
                                           direction:index < self.currentPage ? UIPageViewControllerNavigationDirectionReverse : UIPageViewControllerNavigationDirectionForward
                                            animated:animated
                                          completion:^(BOOL finished) {
        if (weakSelf && weakSelf.currentPage != index) {
            weakSelf.currentPage = index;
            if (weakSelf.onPageSelected) {
                weakSelf.onPageSelected(@{
                    @"position": [NSNumber numberWithInteger:weakSelf.currentPage]
                });
            }
        }
    }];
    self.reactPageViewController.view.frame = self.bounds;
    [self.reactPageViewController.view layoutIfNeeded];
}

- (UIViewController *)getControllerForView:(UIView *)view {
    UIViewController *controller = [self.controllerCache objectForKey:view];
    if (!controller) {
        controller = [UIViewController alloc];
        controller.view = view;
        [self.controllerCache setObject:controller forKey:view];
    }
    return controller;
}

- (UIViewController *)getControllerAtPosition:(NSInteger)position {
    if (position < 0 || position >= self.count) {
        return nil;
    }
    UIViewController *controller;
    UIView *reactView = [self getViewAtPosition:position];
    if (reactView) {
        controller = [self getControllerForView:reactView];
    } else {
        // Not yet rendered? Give placeholder.
        controller = [UIViewController alloc];
    }

    [self.pageIndexes setObject:[NSNumber numberWithInteger:position] forKey:controller];
    return controller;
}

- (UIView *)getViewAtPosition:(NSInteger)position {
    NSInteger index = position - self.offset;
    if (index >= 0 && index < self.reactSubviews.count) {
        return self.reactSubviews[index];
    }
    return nil;
}

#pragma mark - UIPageViewControllerDelegate

- (void)pageViewController:(UIPageViewController *)pageViewController
        didFinishAnimating:(BOOL)finished
   previousViewControllers:(nonnull NSArray<UIViewController *> *)previousViewControllers
       transitionCompleted:(BOOL)completed {
    if (!completed) {
        return;
    }
    UIViewController* controller = pageViewController.viewControllers.firstObject;
    NSNumber *pageIndex = [self.pageIndexes objectForKey:controller];
    if (!pageIndex) {
        return;
    }
    self.currentPage = [pageIndex integerValue];

    if (self.onPageSelected) {
        self.onPageSelected(@{
            @"position": [NSNumber numberWithInteger:self.currentPage]
        });
    }
}

#pragma mark - UIPageViewControllerDataSource

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
       viewControllerAfterViewController:(UIViewController *)viewController {
    NSNumber *pageIndex = [self.pageIndexes objectForKey:viewController];
    if (pageIndex) {
        return [self getControllerAtPosition:[pageIndex integerValue] + 1];
    }
    return nil;
}

- (UIViewController *)pageViewController:(UIPageViewController *)pageViewController
      viewControllerBeforeViewController:(UIViewController *)viewController {
    NSNumber *pageIndex = [self.pageIndexes objectForKey:viewController];
    if (pageIndex) {
        return [self getControllerAtPosition:[pageIndex integerValue] - 1];
    }
    return nil;
}

#pragma mark - UIScrollViewDelegate

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    if (!self.onPageScroll) {
        return;
    }
    CGPoint point = scrollView.contentOffset;
    float offset = 0;
    if (self.frame.size.width != 0) {
        offset = (point.x - self.frame.size.width) / self.frame.size.width;
    }
    if (fabs(offset) > 1) {
        offset = offset > 0 ? 1.0 : -1.0;
    }
    NSInteger position = self.currentPage;
    if (offset < 0 && position > 0) {
        offset += 1;
        position -= 1;
    }
    self.onPageScroll(@{
        @"offset": [NSNumber numberWithFloat:offset],
        @"position": [NSNumber numberWithInteger:position]
    });
}

@end
