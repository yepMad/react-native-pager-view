/*
Inspiration: https://dribbble.com/shots/3894781-Urbanears-Headphones
Twitter: http://twitter.com/mironcatalin
GitHub: http://github.com/catalinmiron
Video Tutorial: https://youtu.be/cGTD4yYgEHc
*/

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import type { ViewPagerOnPageScrollEventData } from 'src/types';
import ViewPager from '@react-native-community/viewpager';

const data = [
  {
    type: 'Humlan P',
    imageUri: require('../assets/urbanears_blue.png'),
    heading: 'Vibrant colors',
    description: 'Four on-trend colorways to seamlessly suit your style.',
    key: 'first',
    color: '#9dcdfa',
  },
  {
    type: 'Pampas',
    imageUri: require('../assets/urbanears_pink.png'),
    heading: 'Redefined sound',
    description: 'A bold statement tuned to perfection.',
    key: 'second',
    color: '#db9efa',
  },
  {
    type: 'Humlan P',
    imageUri: require('../assets/urbanears_grey.png'),
    heading: 'Great quality',
    description:
      'An Urbanears classic! Listen-all-day fit. Striking the perfect balance of effortless technology',
    key: 'third',
    color: '#999',
  },
  {
    type: 'Humlan B',
    imageUri: require('../assets/urbanears_mint.png'),
    heading: 'From Sweden',
    description:
      'The “Plattan” in Plattan headphones is Swedish for “the slab.”',
    key: 'fourth',
    color: '#a1e3a1',
  },
];
const { width, height } = Dimensions.get('window');
const LOGO_WIDTH = 220;
const LOGO_HEIGHT = 40;
const DOT_SIZE = 40;
const TICKER_HEIGHT = 40;
const CIRCLE_SIZE = width * 0.6;

const Circle = ({ scrollX }) => {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.circleContainer]}>
      {data.map(({ color }, index) => {
        const inputRange = [
          (index - 0.55) * width,
          index * width,
          (index + 0.55) * width,
        ];
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0, 0.2, 0],
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              {
                backgroundColor: color,
                opacity,
                transform: [{ scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const Ticker = ({ scrollX }) => {
  const inputRange = [-width, 0, width];
  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [TICKER_HEIGHT, 0, -TICKER_HEIGHT],
  });
  return (
    <View style={styles.tickerContainer}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {data.map(({ type }, index) => {
          return (
            <Text key={index} style={styles.tickerText}>
              {type}
            </Text>
          );
        })}
      </Animated.View>
    </View>
  );
};

const Item = ({
  imageUri,
  heading,
  description,
  index,
  onPageScrollOffset,
}) => {
  const inputRange = [0, 0.5, 0.99];
  const inputRangeOpacity = [0, 0.5, 0.99];
  const scale = onPageScrollOffset.interpolate({
    inputRange,
    outputRange: [1, 0, 1],
  });
  // const translateXHeading = onPageScrollOffset.interpolate({
  //   inputRange,
  //   outputRange: [0, width * 0.1, 0],
  //   // outputRange: [width * 0.1, 0, -width * 0.1],
  // });
  // const translateXDescription = onPageScrollOffset.interpolate({
  //   inputRange,
  //   outputRange: [width * 0.7, 0, -width * 0.7],
  // });
  const opacity = onPageScrollOffset.interpolate({
    inputRange: inputRangeOpacity,
    outputRange: [1, 0, 1],
  });

  return (
    <View style={styles.itemStyle}>
      <Animated.Image
        source={imageUri}
        style={[
          styles.imageStyle,
          {
            transform: [{ scale }],
          },
        ]}
      />
      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.heading,
            {
              opacity,
              // transform: [{ translateX: translateXHeading }],
            },
          ]}
        >
          {heading}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.description,
            {
              opacity,
              // transform: [
              //   {
              //     translateX: translateXDescription,
              //   },
              // ],
            },
          ]}
        >
          {description}
        </Animated.Text>
      </View>
    </View>
  );
};

const Pagination = ({ scrollX }) => {
  const inputRange = [-width, 0, width];
  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [-DOT_SIZE, 0, DOT_SIZE],
  });
  return (
    <View style={[styles.pagination]}>
      <Animated.View
        style={[
          styles.paginationIndicator,
          {
            position: 'absolute',
            transform: [{ translateX }],
          },
        ]}
      />
      {data.map((item) => {
        return (
          <View key={item.key} style={styles.paginationDotContainer}>
            <View
              style={[styles.paginationDot, { backgroundColor: item.color }]}
            />
          </View>
        );
      })}
    </View>
  );
};

const AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);

export default function HeadphonesCarouselExample() {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const onPageScrollOffset = React.useRef(new Animated.Value(0)).current;
  const onPageScrollPosition = React.useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <Circle scrollX={scrollX} />
      <AnimatedViewPager
        initialPage={0}
        style={{ width: '100%', height: '100%' }}
        onPageScroll={Animated.event<ViewPagerOnPageScrollEventData>(
          [
            {
              nativeEvent: {
                offset: onPageScrollOffset,
                position: onPageScrollPosition,
              },
            },
          ],
          {
            listener: ({ nativeEvent: { offset, position } }) => {
              console.log(`Position: ${position} Offset: ${offset}`);
            },
            useNativeDriver: true,
          }
        )}
      >
        {data.map((item, index) => (
          <View
            // style={{ backgroundColor: 'red' }}
            collapsable={false}
            key={index}
          >
            <Item
              {...item}
              index={index}
              onPageScrollOffset={onPageScrollOffset}
            />
          </View>
        ))}
      </AnimatedViewPager>
      <Image
        style={styles.logo}
        source={require('../assets/ue_black_logo.png')}
      />
      <Pagination scrollX={scrollX} />
      <Ticker scrollX={scrollX} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemStyle: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    width: width * 0.75,
    height: width * 0.75,
    resizeMode: 'contain',
    flex: 1,
  },
  textContainer: {
    alignItems: 'flex-start',
    alignSelf: 'flex-end',
    flex: 0.5,
  },
  heading: {
    color: '#444',
    textTransform: 'uppercase',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 5,
  },
  description: {
    color: '#ccc',
    fontWeight: '600',
    textAlign: 'left',
    width: width * 0.75,
    marginRight: 10,
    fontSize: 16,
    lineHeight: 16 * 1.5,
  },
  logo: {
    opacity: 0.9,
    height: LOGO_HEIGHT,
    width: LOGO_WIDTH,
    resizeMode: 'contain',
    position: 'absolute',
    left: 10,
    bottom: 10,
    transform: [
      { translateX: -LOGO_WIDTH / 2 },
      { translateY: -LOGO_HEIGHT / 2 },
      { rotateZ: '-90deg' },
      { translateX: LOGO_WIDTH / 2 },
      { translateY: LOGO_HEIGHT / 2 },
    ],
  },
  pagination: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    flexDirection: 'row',
    height: DOT_SIZE,
  },
  paginationDot: {
    width: DOT_SIZE * 0.3,
    height: DOT_SIZE * 0.3,
    borderRadius: DOT_SIZE * 0.15,
  },
  paginationDotContainer: {
    width: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationIndicator: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  tickerContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    overflow: 'hidden',
    height: TICKER_HEIGHT,
  },
  tickerText: {
    fontSize: TICKER_HEIGHT,
    lineHeight: TICKER_HEIGHT,
    textTransform: 'uppercase',
    fontWeight: '800',
  },

  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    position: 'absolute',
    top: '15%',
  },
});