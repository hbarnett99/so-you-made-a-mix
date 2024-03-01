'use client';
import { TextGenerateEffect } from '../ui/text-generate-effect';

const words = 'So, you made a mix?';

const TitleWords = () => {
  return (
    <>
      <TextGenerateEffect
        words={words}
        className=''
      />
    </>
  );
};

export default TitleWords;
