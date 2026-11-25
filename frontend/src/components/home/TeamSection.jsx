import "../../styles/TeamSection.css";

const teamMembers = [
  {
    name: "Leena Al-Sammoui",
    role: "Backend Developer",
    description:
      "Back-end enthusiast with strong logic and API integration skills. Focused on writing efficient, scalable code and solving complex problems.",
    image: "/images/team/Leena.jpg",
  },
  {
    name: "Rami Ebdah",
    role: "Backend Developer",
    description:
      "Passionate about turning ideas into real-world solutions. Enjoys problem-solving and building meaningful systems with clean architecture.",
    image: "/images/team/ram.png",
  },
  {
    name: "Raghad Azzouqa",
    role: "Front-End Developer",
    description:
      "Front-end specialist passionate about crafting intuitive and visually appealing user experiences. Enjoys transforming ideas into responsive, accessible interfaces.",
    image: "/images/team/raghad.jpg",
  },

  {
    name: "Noor Alhabash",
    role: "Frontend Developer",
    description:
      "Design lover and pixel perfectionist, I enjoy building beautiful and user-friendly interfaces that make users smile.",
    image: "/images/team/Noor.jpg",
  },

  {
    name: "Dr.Mohammad A.M.Abushariah",
    role: "Project Supervisor",
    description:
      "Guiding the team with vision and expertise, ensuring our project stays on track and reaches its full potential.",
    image: "/images/team/Dr.M.jpg",
  },
];

// Separate members
const developers = teamMembers.filter(
  (member) => member.role !== "Project Supervisor"
);
const supervisor = teamMembers.find(
  (member) => member.role === "Project Supervisor"
);

const TeamSection = () => {
  return (
    <section className="team-section" id="team">
      <h2 className="team-title">Meet Our Team</h2>
      {supervisor && (
        <div className="supervisor-section">
          <h2 className="supervisor-title">Project Supervisor</h2>
          <div className="team-card supervisor-card">
            <div className="image-container">
              <img src={supervisor.image} alt={supervisor.name} />
            </div>
            <h3>{supervisor.name}</h3>
            <p className="role">{supervisor.role}</p>
            <p className="desc">{supervisor.description}</p>
          </div>
        </div>
      )}{" "}
      <br />
      <h2 className="supervisor-title">Development Team</h2>
      <div className="team-grid">

        {developers.map((member, index) => (
          <div className="team-card" key={index}>

            <div className="image-container">
              <img src={member.image} alt={member.name} />
            </div>
            <h3>{member.name}</h3>
            <p className="role">{member.role}</p>
            <p className="desc">{member.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;