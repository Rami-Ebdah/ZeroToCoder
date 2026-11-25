
const Footer = () => {
  return (
    <footer>
      <div className="footer-bottom">
        <button
          onClick={() =>
            document
              .getElementById("team")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          About
        </button>
        <p>© 2025 ZeroToCoder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
