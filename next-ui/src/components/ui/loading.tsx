'use client'

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const Loading = () => {
    

    return (
      <motion.div className='h-full align-middle justify-center'>
        <Loader2
          className='animate-spin'
          size={64}
        />
      </motion.div>
    );
}

export default Loading