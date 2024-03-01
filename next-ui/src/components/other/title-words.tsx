'use client';
import { TextGenerateEffect } from '../ui/text-generate-effect';

const words1 = 'So, you made a mix?';

const TitleWords = () => {
  return (
    <TextGenerateEffect
      words={words1}
      className=''
    />
  );
};

export default TitleWords;
