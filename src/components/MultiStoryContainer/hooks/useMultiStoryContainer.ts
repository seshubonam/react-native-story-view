import { useEffect, useRef, useState } from 'react';
import Animated, { useValue } from 'react-native-reanimated';
import { useKeyboardListener } from '../../../hooks';
import {
  MultiStoryContainerProps,
  TransitionMode,
  ScrollValue,
  ViewConfig,
} from '../types';
import {
  cubeTransition,
  defaultTransition,
  scaleTransition,
} from '../utils/StoryTransitions';
import useDraggableGesture from './useDraggableGesture';

const useMultiStoryContainer = (
  flatListRef: any,
  {
    userStoryIndex,
    backgroundColor,
    transitionMode = TransitionMode.Cube,
  }: Partial<MultiStoryContainerProps>,
  onScrollBeginDrag: () => void,
  onScrollEndDrag: () => void,
  handleLongPress: (visibility: boolean) => void,
  onComplete?: () => void
) => {
  const [storyIndex, setStoryIndex] = useState(userStoryIndex ?? 0);
  const scrollX: ScrollValue = useValue(0);
  const previousIndex = useRef<number>(0);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  });
  const isKeyboardVisible = useKeyboardListener();

  useEffect(() => {
    flatListRef?.current?.setNativeProps({ scrollEnabled: !isKeyboardVisible });
  }, [flatListRef, isKeyboardVisible]);

  const onViewRef = useRef(({ viewableItems }: ViewConfig) => {
    const index = viewableItems?.[0]?.index;
    if (index == null) return;
    /* viewableItems returns array of current/next viewable item
           During story transition current/next or previous/current both visible on screen so array contains both items.
           To consider only next/previous item, checking length is only 1 and it is not previous story.  
        */
    if (viewableItems.length === 1 && index !== previousIndex.current) {
      setStoryIndex(index);
      previousIndex.current = index;
    }
  });

  const onScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: { x: scrollX },
        },
      },
    ],
    { useNativeDriver: true }
  );

  const animatedTransitionStyle = (index: number) => {
    switch (transitionMode) {
      case TransitionMode.Cube:
        return cubeTransition(index, scrollX);
      case TransitionMode.Scale:
        return scaleTransition(index, scrollX);
      default:
        return defaultTransition();
    }
  };

  const { listStyle, rootStyle, gestureHandler } = useDraggableGesture({
    backgroundColor,
    onComplete,
    onScrollBeginDrag,
    onScrollEndDrag,
    handleLongPress,
    isKeyboardVisible,
  });

  return {
    scrollX,
    onViewRef,
    viewabilityConfig,
    listStyle,
    rootStyle,
    storyIndex,
    gestureHandler,
    setStoryIndex,
    onScroll,
    animatedTransitionStyle,
  };
};

export default useMultiStoryContainer;
