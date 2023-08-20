import {
  AnimatePresence,
  motion,
  animate,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  Transition,
} from 'framer-motion';
import {
  Dialog,
  ModalOverlay,
  Modal,
  Button,
  Heading,
} from 'react-aria-components';
import { useEffect, useState } from 'react';

// Wrap React Aria modal components so they support framer-motion values.
const MotionModal = motion(Modal);
const MotionModalOverlay = motion(ModalOverlay);

const inertiaTransition = {
  type: 'inertia' as Transition['type'],
  bounceStiffness: 300,
  bounceDamping: 40,
  timeConstant: 300,
};

const staticTransition = {
  duration: 0.5,
  ease: [0.32, 0.72, 0, 1],
};

const SHEET_MARGIN = 34;
const SHEET_RADIUS = 12;

const getWindow = () => {
  if (typeof window === 'undefined') {
    return {
      innerHeight: 0,
      innerWidth: 0,
      screen: { height: 0 },
    };
  }
  return window;
};

const randomUserId = Math.floor(Math.random() * 1000000);

export default function Sheet() {
  const window = getWindow();
  const [isOpen, setOpen] = useState(false);
  const h = window.innerHeight - SHEET_MARGIN;
  const y = useMotionValue(h);
  const bgOpacity = useTransform(y, [0, h], [0.4, 0]);
  const bg = useMotionTemplate`rgba(0, 0, 0, ${bgOpacity})`;
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<
    {
      id: number;
      message: string;
    }[]
  >([]);

  // Scale the background down and adjust the border radius when the sheet is open.
  const bodyScale = useTransform(
    y,
    [0, h],
    [(window.innerWidth - SHEET_MARGIN) / window.innerWidth, 1],
  );
  const bodyTranslate = useTransform(
    y,
    [0, h],
    [SHEET_MARGIN - SHEET_RADIUS, 0],
  );
  const bodyBorderRadius = useTransform(y, [0, h], [SHEET_RADIUS, 0]);

  const fetchMessages = async () => {
    const messagesResponse = await fetch('/api/show');
    const messages = await messagesResponse.json();
    setMessages(messages ?? []);
  };

  const handleSendMessage = async () => {
    setInputMessage('');
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({
        id: randomUserId,
        message: inputMessage,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    fetchMessages();
  };

  useEffect(() => {
    setInterval(() => {
      fetchMessages();
    }, 1000);
  }, []);

  useEffect(() => {
    const chatList = document.getElementById('chat-list');
    if (chatList) {
      chatList.scrollTo({
        top: chatList.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <motion.div
      className="p-4 bg-white h-full overflow-auto text-center"
      style={{
        scale: bodyScale,
        borderRadius: bodyBorderRadius,
        y: bodyTranslate,
        transformOrigin: 'center 0',
      }}
    >
      <Button
        className="text-blue-600 text-lg font-semibold my-8 outline-none rounded data-[pressed]:text-blue-700 data-[focus-visible]:ring"
        onPress={() => setOpen(true)}
      >
        Open live chat
      </Button>
      <AnimatePresence>
        {isOpen && (
          <MotionModalOverlay
            // Force the modal to be open when AnimatePresence renders it.
            isOpen
            onOpenChange={setOpen}
            className="fixed inset-0 z-10"
            // @ts-expect-error
            style={{ backgroundColor: bg }}
          >
            <MotionModal
              className="bg-white absolute bottom-0 w-full bottom-0 rounded-t-xl shadow-lg"
              initial={{ y: h }}
              animate={{ y: 0 }}
              exit={{ y: h }}
              transition={staticTransition}
              style={{
                y,
                top: SHEET_MARGIN,
                // Extra padding at the bottom to account for rubber band scrolling.
                paddingBottom: window.screen.height,
              }}
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y > window.innerHeight * 0.75 || velocity.y > 10) {
                  setOpen(false);
                } else {
                  animate(y, 0, { ...inertiaTransition, min: 0, max: 0 });
                }
              }}
            >
              {/* drag affordance */}
              <div className="mx-auto w-12 mt-2 h-1.5 rounded-full bg-gray-400" />
              <Dialog className="px-4 pb-4 outline-none">
                <div className="flex justify-end">
                  <Button
                    className="text-blue-600 text-lg font-semibold mb-8 outline-none rounded data-[pressed]:text-blue-700 data-[focus-visible]:ring"
                    onPress={() => setOpen(false)}
                  >
                    Done
                  </Button>
                </div>
                <Heading className="text-xl font-semibold mb-4">
                  Live Chat on Lorem Ipsum Bag
                </Heading>

                <div className="h-96 overflow-y-auto" id="chat-list">
                  {messages.map((message, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <p key={`item-${index}`} className="text-sm mb-4">
                      <b>User {message.id}:</b> {message.message}
                    </p>
                  ))}
                </div>

                <div className="bg-white mt-44 rounded-lg p-1 flex border">
                  <input
                    className="w-full rounded py-2 px-3 mr-2"
                    type="text"
                    placeholder="Type your message here..."
                    value={inputMessage}
                    onChange={e => {
                      setInputMessage(e.target.value);
                    }}
                    onKeyUp={e => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    className="text-blue-500 font-bold py-2 px-4 rounded"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </Dialog>
            </MotionModal>
          </MotionModalOverlay>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
