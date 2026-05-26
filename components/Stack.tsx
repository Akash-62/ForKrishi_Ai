import { motion, useMotionValue, useTransform, PanInfo, animate } from 'motion/react';
import { useState, useEffect, ReactNode, useCallback } from 'react';
import './Stack.css';

function getSeed(id: number) {
  const x = Math.sin(id) * 10000;
  return x - Math.floor(x);
}

interface CardRotateProps {
  children: ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
  disableDrag?: boolean;
  isTop?: boolean;
  triggerFlyout?: boolean;
}

function CardRotate({ 
  children, 
  onSendToBack, 
  sensitivity, 
  disableDrag = false, 
  isTop = false,
  triggerFlyout = false
}: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);
  const [isAnimating, setIsAnimating] = useState(false);

  const runFlyout = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Play a gorgeous fly-out animation to the right and slightly up
    animate(x, 380, { duration: 0.25, ease: [0.25, 1, 0.5, 1] });
    animate(y, -40, { duration: 0.25, ease: [0.25, 1, 0.5, 1] }).then(() => {
      onSendToBack();
      // Smoothly animate back to center behind the deck!
      animate(x, 0, { type: 'spring', stiffness: 200, damping: 25 });
      animate(y, 0, { type: 'spring', stiffness: 200, damping: 25 }).then(() => {
        setIsAnimating(false);
      });
    });
  }, [x, y, onSendToBack, isAnimating]);

  useEffect(() => {
    if (triggerFlyout && !isAnimating && isTop) {
      const timer = setTimeout(() => {
        runFlyout();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [triggerFlyout, isAnimating, isTop, runFlyout]);

  function handleDragEnd(_: any, info: PanInfo) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      const flyOutX = info.offset.x > 0 ? 380 : -380;
      const flyOutY = info.offset.y;
      animate(x, flyOutX, { duration: 0.2, ease: 'easeOut' });
      animate(y, flyOutY, { duration: 0.2, ease: 'easeOut' }).then(() => {
        onSendToBack();
        animate(x, 0, { type: 'spring', stiffness: 200, damping: 25 });
        animate(y, 0, { type: 'spring', stiffness: 200, damping: 25 });
      });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 20 });
    }
  }

  const handleTap = (e: React.MouseEvent) => {
    // If they clicked on a button inside the card, do not trigger flyout!
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    
    if (isAnimating || !isTop) return;
    runFlyout();
  };

  return (
    <motion.div
      className={disableDrag ? "card-rotate-disabled" : "card-rotate"}
      style={{ 
        x, 
        y, 
        rotateX: disableDrag ? 0 : rotateX, 
        rotateY: disableDrag ? 0 : rotateY 
      }}
      drag={disableDrag ? false : true}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={disableDrag ? undefined : { cursor: 'grabbing' }}
      onDragEnd={disableDrag ? undefined : handleDragEnd}
      onClick={handleTap}
    >
      {children}
    </motion.div>
  );
}

interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  cards?: ReactNode[];
  animationConfig?: { stiffness: number; damping: number };
  sendToBackOnClick?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  mobileClickOnly?: boolean;
  mobileBreakpoint?: number;
  activeIndex?: number;
  onCardChange?: (index: number) => void;
}

export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cards = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  mobileClickOnly = false,
  mobileBreakpoint = 768,
  activeIndex,
  onCardChange
}: StackProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  const shouldDisableDrag = mobileClickOnly && isMobile;

  const [stack, setStack] = useState<{ id: number; content: ReactNode }[]>(() => {
    return cards.map((content, index) => ({ 
      id: index + 1, 
      content
    }));
  });

  // Synchronize stack state during render if the cards array changes
  const [prevCards, setPrevCards] = useState<ReactNode[]>(cards);
  if (cards !== prevCards) {
    setPrevCards(cards);
    if (cards.length === stack.length) {
      setStack(prev => prev.map(item => ({
        ...item,
        content: cards[item.id - 1]
      })));
    } else {
      setStack(cards.map((content, index) => ({
        id: index + 1,
        content
      })));
    }
  }

  // Synchronize activeIndex state during render if activeIndex prop changes
  const [prevActiveIndex, setPrevActiveIndex] = useState<number | undefined>(activeIndex);
  if (activeIndex !== prevActiveIndex) {
    setPrevActiveIndex(activeIndex);
    if (activeIndex !== undefined) {
      const targetId = activeIndex + 1;
      const index = stack.findIndex(card => card.id === targetId);
      if (index !== -1 && index !== stack.length - 1) {
        const newStack = [...stack];
        const [card] = newStack.splice(index, 1);
        newStack.push(card);
        setStack(newStack);
      }
    }
  }

  const sendToBack = (id: number) => {
    setAnimatingId(null);
    setStack(prev => {
      const newStack = [...prev];
      const index = newStack.findIndex(card => card.id === id);
      if (index === -1) return prev;
      const [card] = newStack.splice(index, 1);
      newStack.unshift(card);

      if (onCardChange) {
        const nextTopCard = newStack[newStack.length - 1];
        onCardChange(nextTopCard.id - 1);
      }

      return newStack;
    });
  };

  useEffect(() => {
    if (autoplay && stack.length > 1 && !isPaused && animatingId === null) {
      const interval = setInterval(() => {
        const topCardId = stack[stack.length - 1].id;
        setAnimatingId(topCardId);
      }, autoplayDelay);

      return () => clearInterval(interval);
    }
  }, [autoplay, autoplayDelay, stack, isPaused, animatingId]);

  return (
    <div
      className="stack-container"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => {
        const isTop = index === stack.length - 1;
        const rotateSeedVal = randomRotation ? getSeed(card.id) * 10 - 5 : 0;
        const mobileRotateSeedVal = randomRotation ? getSeed(card.id) * 4 - 2 : 0;
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={shouldDisableDrag}
            isTop={isTop}
            triggerFlyout={animatingId === card.id}
          >
            <motion.div
              className="card"
              animate={{
                rotateZ: isMobile 
                  ? (stack.length - index - 1) * 2 + mobileRotateSeedVal
                  : (stack.length - index - 1) * 4 + rotateSeedVal,
                scale: isMobile
                  ? 1 + index * 0.03 - stack.length * 0.03
                  : 1 + index * 0.06 - stack.length * 0.06,
                transformOrigin: '90% 90%'
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping
              }}
            >
              {card.content}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}
