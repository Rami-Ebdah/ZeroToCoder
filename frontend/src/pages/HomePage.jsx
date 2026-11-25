import { useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Tagline from "../components/home/Tagline";
import Main from "../components/home/Main";
import TeamSection from "../components/home/TeamSection";
import Contact from "../components/home/Contact";

const HomePage = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Header />
      <Tagline />
      <div className="divider" />
      <Main />
      <div className="divider" />
      <TeamSection />
      <div className="divider" />
      <Contact />
      <div className="divider" />
      <Footer />
      <a
        href="#up"
        className="scroll2Top"
        aria-label="Scroll to top"
        style={{ opacity: showScrollButton ? 1 : 0, transition: "1s" }}
      >
        <FaChevronUp size={13.5} />
      </a>
    </>
  );
};

export default HomePage;
