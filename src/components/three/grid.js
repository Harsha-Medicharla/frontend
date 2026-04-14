import React, { useState, useEffect, useRef } from "react";
import Hero from "../Hero";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Topbar from "../Topbar/Topbar";
import ReactMarkdown from "react-markdown";
import styles1 from './right.module.css';
import { toast } from "react-toastify";
import { supabase } from '../../supabase/supabase';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { motion } from "framer-motion";
import "react-vertical-timeline-component/style.min.css";
import { styles } from "../../styles";
import { textVariant } from "../../utils/motion";

// Extracts the YouTube video ID from a standard watch URL
// e.g. "https://www.youtube.com/watch?v=MFhxShGxHWc" → "MFhxShGxHWc"
const extractYouTubeId = (url) => {
  try {
    const u = new URL(url);
    return u.searchParams.get("v") || null;
  } catch {
    return null;
  }
};

const extractDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const LoadingSkeleton = () => (
  <div className="flex items-center space-x-12 mt-4 px-6">
    <div className="w-6 h-6 rounded-full bg-dark-layer-1 animate-pulse"></div>
    <div className="h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1 animate-pulse"></div>
    <div className="h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1 animate-pulse"></div>
    <div className="h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1 animate-pulse"></div>
  </div>
);

// Accepts a plain YouTube URL string (from yt_links)
const VideoCard = ({ url, isLoading }) => {
  const videoId = extractYouTubeId(url);

  return (
    <VerticalTimelineElement
      contentStyle={{ background: "#1d1836", color: "#fff" }}
      contentArrowStyle={{ borderRight: "7px solid #232631" }}
      iconStyle={{ background: "#1d1836", color: "#fff" }}
    >
      {isLoading ? (
        <LoadingSkeleton />
      ) : videoId ? (
        <div>
          <iframe
            width="100%"
            height="285"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={`YouTube video ${videoId}`}
            allowFullScreen
            className="rounded-lg"
          />
          <h3 className="text-white text-[16px] font-semibold mt-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              {url}
            </a>
          </h3>
        </div>
      ) : (
        <div className="p-4 bg-gray-800 rounded-lg text-center">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
            {url}
          </a>
        </div>
      )}
    </VerticalTimelineElement>
  );
};

const ExperienceCard = ({ link, isLoading }) => (
  <VerticalTimelineElement
    className="vertical-timeline-element--work"
    iconStyle={{ background: "transparent", display: "none" }}
    contentStyle={{ background: "#1d1836", color: "#fff", padding: "0" }}
    contentArrowStyle={{
      borderRight: "7px solid #232631",
      backgroundImage: "linear-gradient(to right, #9333ea, #ec4899)",
    }}
  >
    {isLoading ? (
      <LoadingSkeleton />
    ) : (
      <div>
        <h3 className="text-white text-[24px] font-bold">
          <a href={link} target="_blank" rel="noopener noreferrer">
            {extractDomain(link)}
          </a>
        </h3>
      </div>
    )}
  </VerticalTimelineElement>
);

const Learn = () => {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState(null);
  const [linkclub, setLinkClub] = useState(null);
  const [videolinks, setVideoLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const resultRef = useRef(null);

  const [userDetails, setUserDetails] = useState({
    profession: "",
    age: 0,
    experience: "",
    level: 0,
  });

  useEffect(() => {
    if (!isLoading && result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading, result]);

  const handleSubmit = async (maintopic) => {
    if (!maintopic.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to submit", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    try {
      setIsLoading(true);
      setIsLoadingButton(true);

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      const details = {
        profession: data[0].profession,
        age: data[0].age,
        experience: data[0].experience,
        level: data[0].level,
      };
      setUserDetails(details);

      const storedPrevResponse = localStorage.getItem("ai-prev-response");
      const parsedPrevResponse =
        storedPrevResponse && storedPrevResponse !== "undefined"
          ? JSON.parse(storedPrevResponse)
          : null;

      const apiRequestBody = {
        topic: maintopic,
        profession: details.profession,
        age: details.age,
        level: details.level,
        experience: details.experience,
        prev_response: parsedPrevResponse,
      };

      const response = await fetch("http://127.0.0.1:8000/askAI/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const responseData = await response.json();

      // ✅ Backend returns: { response: { content, resource_links, yt_links } }
      const payload = responseData.response ?? responseData;

      const content       = payload.content        ?? "";
      const resourceLinks = payload.resource_links ?? [];
      const ytLinks       = payload.yt_links       ?? [];

      setResult(content);
      setLinkClub(resourceLinks);
      setVideoLinks(ytLinks);           // plain URL strings e.g. "https://www.youtube.com/watch?v=..."

      localStorage.setItem("ai-prev-response", JSON.stringify(content));
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingButton(false);
    }
  };

  return (
    <div>
      <Topbar />
      <div className={styles1.main}>
        <div className={styles1.right}>
          <Hero />

          {/* ── Input Bar ── */}
          <div className={styles1.bottomsection}>
            <div className={styles1.messagebar}>
              <input
                type="text"
                placeholder="What do you want to explore ..."
                onChange={(e) => setTopic(e.target.value)}
                value={topic}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(topic)}
                className="bg-dark-fill-3 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <button
                onClick={() => handleSubmit(topic)}
                disabled={isLoadingButton}
                className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-60"
              >
                {isLoading ? (
                  <AiOutlineLoading3Quarters className="animate-spin w-6 h-6 text-white" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ── AI Content ── */}
          <div>
            {result && (
              <div ref={resultRef}>
                <motion.div variants={textVariant()}>
                  <div className="rounded-md m-20 p-8 shadow-xl">
                    <ReactMarkdown className="prose pt-3 text-white p-8 rounded-md shadow-xl z-10">
                      {typeof result === "string" ? result : ""}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              </div>
            )}

            {/* ── Videos ── */}
            {Array.isArray(videolinks) && videolinks.length > 0 && (
              <>
                <motion.div variants={textVariant()}>
                  <h2 className={`${styles.sectionHeadText} m-20 text-center`}>
                    VIDEOS
                  </h2>
                </motion.div>
                <VerticalTimeline>
                  {videolinks.map((url, index) => (
                    <VideoCard key={`video-${index}`} url={url} isLoading={isLoading} />
                  ))}
                </VerticalTimeline>
              </>
            )}
          </div>

          {/* ── Resource Links ── */}
          <div>
            {Array.isArray(linkclub) && linkclub.length > 0 && (
              <>
                <motion.div variants={textVariant()}>
                  <h2 className={`${styles.sectionHeadText} m-20 text-center`}>
                    Some Useful Content and Links
                  </h2>
                </motion.div>
                <div>
                  {isLoading ? (
                    <div className="max-w-[1200px] mx-auto sm:w-7/12 w-full animate-pulse">
                      {[...Array(10)].map((_, idx) => (
                        <LoadingSkeleton key={idx} />
                      ))}
                    </div>
                  ) : (
                    <VerticalTimeline>
                      {linkclub.slice(0, 8).map((link, index) => (
                        <ExperienceCard key={`experience-${index}`} link={link} />
                      ))}
                    </VerticalTimeline>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;