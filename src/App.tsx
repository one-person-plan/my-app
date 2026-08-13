import { useState } from 'react';
import type { OogiriQuestion, OogiriAnswer } from '@/data/types';
import { AppProvider } from '@/store/AppContext';
import { Header } from '@/components/Header';
import { TabBar, type TabKey } from '@/components/TabBar';
import { ListScreen } from '@/screens/ListScreen';
import { CalendarScreen } from '@/screens/CalendarScreen';
import { TimerScreen } from '@/screens/TimerScreen';
import { EventDetailScreen } from '@/screens/EventDetailScreen';
import { AnswerDetailScreen } from '@/screens/AnswerDetailScreen';


function Shell() {
  const [tab, setTab] = useState<TabKey>('list');
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [answerQuestion, setAnswerQuestion] = useState<OogiriQuestion | undefined>();
  const [answerDetail, setAnswerDetail] = useState<{
    question: OogiriQuestion;
    answer: OogiriAnswer;
  } | undefined>();

  const openEvent = (id: string) => setOpenEventId(id);

  const openAnswer = (question: OogiriQuestion) => {
    setAnswerQuestion(question);
    setAnswerDetail(undefined);
    setOpenEventId(null);
    setTab('timer');
  };

  const openAnswerDetail = (
    question: OogiriQuestion,
    answer: OogiriAnswer
  ) => {
    setAnswerDetail({ question, answer });
    setOpenEventId(null);
  };
 
  const back = () => setOpenEventId(null);
 
  return (
    <div className="min-h-screen bg-paper flex justify-center">
      {/* phone frame on larger screens */}
      <div className="w-full max-w-[440px] min-h-screen bg-paper flex flex-col relative phone-shadow sm:my-0">
        {openEventId ? (
          <EventDetailScreen
            eventId={openEventId}
            onBack={back}
            onOpenAnswer={openAnswer}
          />
        ) : answerDetail ? (
          <AnswerDetailScreen
            question={answerDetail.question}
            answer={answerDetail.answer}
            onBack={() => setAnswerDetail(undefined)}
            onAnswerQuestion={openAnswer}
            onShare={() => {
              const postText = [
                answerDetail.question.text || '画像のお題',
                `「${answerDetail.answer.text}」`,
                answerDetail.answer.answerer,
              ].join('\n');
            
              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`;
            
              window.open(url, '_blank');
            }}
          />
        ) : (
          <>
            <Header />
            <main className="flex-1 flex flex-col overflow-hidden">
              {tab === 'list' && (
                <ListScreen
                  onOpenEvent={openEvent}
                  onAnswerQuestion={openAnswer}

               onOpenAnswerDetail={openAnswerDetail}
               />
              )}
              {tab === 'calendar' && <CalendarScreen onOpenEvent={openEvent} />}
              {tab === 'timer' && (
               <TimerScreen
                 initialQuestion={answerQuestion}
               />
              )}
            </main>
            <TabBar active={tab} onChange={setTab} />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
