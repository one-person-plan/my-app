import { useState } from 'react';
import { AppProvider } from '@/store/AppContext';
import { Header } from '@/components/Header';
import { TabBar, type TabKey } from '@/components/TabBar';
import { ListScreen } from '@/screens/ListScreen';
import { CalendarScreen } from '@/screens/CalendarScreen';
import { TimerScreen } from '@/screens/TimerScreen';
import { EventDetailScreen } from '@/screens/EventDetailScreen';

function Shell() {
  const [tab, setTab] = useState<TabKey>('list');
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  const openEvent = (id: string) => setOpenEventId(id);
  const back = () => setOpenEventId(null);

  return (
    <div className="min-h-screen bg-paper flex justify-center">
      {/* phone frame on larger screens */}
      <div className="w-full max-w-[440px] min-h-screen bg-paper flex flex-col relative phone-shadow sm:my-0">
        {openEventId ? (
          <EventDetailScreen eventId={openEventId} onBack={back} />
        ) : (
          <>
            <Header />
            <main className="flex-1 flex flex-col overflow-hidden">
              {tab === 'list' && <ListScreen onOpenEvent={openEvent} />}
              {tab === 'calendar' && <CalendarScreen onOpenEvent={openEvent} />}
              {tab === 'timer' && <TimerScreen />}
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
