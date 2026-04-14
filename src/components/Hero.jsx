import { motion } from "framer-motion";

import { styles } from "../styles";
//import { ComputersCanvas } from "./canvas";

const Hero = () => {
  return (
    <section className={`relative w-full  mx-auto`}>
      <div
        className={`absolute inset-0 top-[120px]  max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
      >
        <div className='flex flex-col justify-center items-center mt-5'>
          <div className='w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-600' />
          <div className='w-1 sm:h-80 h-40 bg-gradient-to-b from-purple-400/20 to-pink-600/20' />
        </div>

        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>
            Learn And <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600'> Explore </span>
          </h1>
          <p className={`${styles.heroSubText} mt-2 text-white`}>
            Dive into the world of <br className='sm:block hidden' />
           Computer Science And Technology
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;