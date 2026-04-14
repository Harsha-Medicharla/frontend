import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { motion } from "framer-motion";

import "react-vertical-timeline-component/style.min.css";

import { styles } from "../styles";
//import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { textVariant } from "../utils/motion";

const ExperienceCard = (link) => {
  return (
    <VerticalTimelineElement
      contentStyle={{
        background: "#1d1836",
        color: "#fff",
      }}
      contentArrowStyle={{ borderRight: "7px solid  #232631" }}
      
    >
      <div>
        <h3 className='text-white text-[24px] font-bold'>{link}</h3>
        <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className=""
                />
      </div>
    </VerticalTimelineElement>
  );
};

const Experience = (props) => {
  const {links} = props;
  console.log(links)
  if (!links || !Array.isArray(links)) {
    return null; // or display an error message or handle it accordingly
  }
  return (
    <>
      <motion.div variants={textVariant()}>
        <h2 className={`${styles.sectionHeadText} text-center`}>
          Some Useful Links
        </h2>
      </motion.div>

      <div className='mt-20 flex flex-col'>
        <VerticalTimeline>
          {links.map((link, index) => (
            <ExperienceCard
              key={`experience-${index}`}
              link={link}
            />
          ))}
        </VerticalTimeline>
      </div>
    </>
  );
};

export default SectionWrapper(Experience, "work");
