import { useState } from 'react';
import type { OogiriQuestion, OogiriAnswer, OogiriEvent } from '@/data/types';
import { AppProvider, useApp } from '@/store/AppContext';
import { Header } from '@/components/Header';
import { TabBar, type TabKey } from '@/components/TabBar';
import { ListScreen } from '@/screens/ListScreen';
import { CalendarScreen } from '@/screens/CalendarScreen';
import { TimerScreen } from '@/screens/TimerScreen';
import { EventDetailScreen } from '@/screens/EventDetailScreen';
import { AnswerDetailScreen } from '@/screens/AnswerDetailScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { loadTemplates, buildPostText } from '@/lib/templates';
import { FavoriteAnswersScreen } from '@/screens/FavoriteAnswersScreen';
import { AllAnswersScreen } from '@/screens/AllAnswersScreen';
import { PastEventsScreen } from '@/screens/PastEventsScreen'

function Shell() {
  const { events, toggleFavorite } = useApp();
  const [tab, setTab] = useState<TabKey>('list');
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [favoriteAnswersOpen, setFavoriteAnswersOpen] = useState(false);
  const [allAnswersOpen, setAllAnswersOpen] = useState(false);
  const [answerDetailFromFavorites, setAnswerDetailFromFavorites] = useState(false);
  const [pastEventsOpen, setPastEventsOpen] = useState(false);
  const [answerQuestion, setAnswerQuestion] = useState<OogiriQuestion | undefined>();
  const [answerDetail, setAnswerDetail] = useState<{
    question: OogiriQuestion;
    answer: OogiriAnswer;
  } | undefined>();

  const openEvent = (id: string) => {
    setFavoriteAnswersOpen(false);
    setAllAnswersOpen(false);
    setPastEventsOpen(false);
    setAnswerDetailFromFavorites(false);
    setOpenEventId(id);
  };

  const openAnswer = (question: OogiriQuestion) => {
    setAnswerQuestion(question);
    setAnswerDetail(undefined);
    setOpenEventId(null);
    setTab('timer');
  };

  const getEventForQuestion = (questionId: string): OogiriEvent | undefined => {
    return events.find((event) =>
      event.questions.some((question) => question.id === questionId)
    );
  };
  
  const getAnswerForDetail = (
    questionId: string,
    answerId: string
  ): OogiriAnswer | undefined => {
    const event = events.find((event) =>
      event.questions.some((question) => question.id === questionId)
    );
  
    return event?.questions
      .find((question) => question.id === questionId)
      ?.answers.find((answer) => answer.id === answerId);
  };

  const openAnswerDetail = (
    question: OogiriQuestion,
    answer: OogiriAnswer
  ) => {
    setAnswerDetail({ question, answer });
    setAnswerDetailFromFavorites(false);
    setOpenEventId(null);
    setFavoriteAnswersOpen(false);
  };

  const openFavoriteAnswerDetail = (
    question: OogiriQuestion,
    answer: OogiriAnswer
  ) => {
    setAnswerDetail({ question, answer });
    setAnswerDetailFromFavorites(true);
    setOpenEventId(null);
    setFavoriteAnswersOpen(false);
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
            onOpenAnswerDetail={openAnswerDetail}
          />
        ) : answerDetail ? (
          <AnswerDetailScreen
            question={answerDetail.question}
            answer={
              getAnswerForDetail(
                answerDetail.question.id,
                answerDetail.answer.id
              ) ?? answerDetail.answer
            }
            event={getEventForQuestion(answerDetail.question.id)}
            onBack={() => {
              setAnswerDetail(undefined);
            
              if (answerDetailFromFavorites) {
                setFavoriteAnswersOpen(true);
              }
            
              setAnswerDetailFromFavorites(false);
            }}
            onAnswerQuestion={openAnswer}
            onOpenEvent={openEvent}
            onShare={() => {
              const templates = loadTemplates();
              const event = getEventForQuestion(answerDetail.question.id);
            
              const postText = buildPostText(
                answerDetail.question.imageUrl
                  ? templates.imageTemplate
                  : templates.textTemplate,
                {
                  question: answerDetail.question.text || '画像のお題',
                  name: answerDetail.answer.answerer,
                  answer: answerDetail.answer.text,
                  hashtag: event?.hashtag ?? '',
                }
              );
            
              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`;
            
              window.open(url, '_blank');
            }}
            onToggleFavorite={() => {
              if (!answerDetail) return;
            
              const event = getEventForQuestion(answerDetail.question.id);
            
              if (!event) return;
            
              toggleFavorite(
                event.id,
                answerDetail.question.id,
                answerDetail.answer.id
              );
            }}
          />
        ) : favoriteAnswersOpen ? (
          <FavoriteAnswersScreen
            onBack={() => setFavoriteAnswersOpen(false)}
            onOpenAnswerDetail={openFavoriteAnswerDetail}
          />
        ) : allAnswersOpen ? (
          <AllAnswersScreen
            onBack={() => setAllAnswersOpen(false)}
            onOpenAnswerDetail={openAnswerDetail}
          />
        ) : pastEventsOpen ? (
          <PastEventsScreen
            onBack={() => setPastEventsOpen(false)}
            onOpenEvent={openEvent}
          />
        ) : settingsOpen ? (
          <SettingsScreen
            onBack={() =>
              setSettingsOpen(false)
            }
          />
        ) : (
          <>
            <Header onOpenSettings={()=> 
              setSettingsOpen(true)}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
              {tab === 'list' && (
                <ListScreen
                  onOpenEvent={openEvent}
                  onAnswerQuestion={openAnswer}
                  onOpenAnswerDetail={openAnswerDetail}
                  onOpenFavoriteAnswers={() => {
                    setFavoriteAnswersOpen(true);
                  }}
                  onOpenAllAnswers={() => setAllAnswersOpen(true)}
                  onOpenPastEvents={() => setPastEventsOpen(true)}
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
