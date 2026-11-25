import Particle from "./Particle.jsx";
import Lottie from "lottie-react";
import "../../styles/Tagline.css";
import devAnimation from "../../assets/animations/dev.json";
import { useRef } from "react";
import { motion } from "framer-motion";

const Tagline = () => {
  const lottieRef = useRef();

  return (
    <section className="tagline flex">
      <div className="particle-area">{<Particle />}</div>

      <div className="left-section  ">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="title"
        >
          Welcome to ZeroToCoder
        </motion.h3>

        <p className="sub-title">
          Embark on your journey to master modern technology.Learn from industry
          experts and build real-world projects.
        </p>
      </div>

      <div className="right-section animation ">
        <Lottie
          lottieRef={lottieRef}
          className=""
          onLoadedImages={() => {
            // @ts-ignore
            // https://lottiereact.com/
            lottieRef.current.setSpeed(0.5);
          }}
          animationData={devAnimation}
        />
      </div>
    </section>
  );
};

export default Tagline;
