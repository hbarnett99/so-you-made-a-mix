import TitleWords from '@/components/other/title-words';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='z-10 max-w-8xl w-full items-center justify-between'>
        <TitleWords />
      </div>
    </main>
  );
}
