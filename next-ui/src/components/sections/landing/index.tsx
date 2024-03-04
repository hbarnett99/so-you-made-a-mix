import { Input } from '@/components/ui/input';
import TitleWords from './title-words';
import PlaylistCard from './playlist-card';

const Landing = () => {
  return (
      <div className='flex items-center space-x-2 pr-2 h-[90%]'>
        <TitleWords />
      </div>
  );
};

export default Landing;
