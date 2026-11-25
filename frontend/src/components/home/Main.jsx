import { FaChalkboardTeacher, FaCode, FaUsers } from 'react-icons/fa';
import '../../styles/Footer.css';

const features = [
  {
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with years of experience',
    icon: FaChalkboardTeacher,
  },
  {
    title: 'Hands-on Projects',
    description: 'Build real projects to apply your knowledge immediately',
    icon: FaCode,
  },
  {
    title: 'Community Support',
    description: 'Join our community of learners and get help when you need it',
    icon: FaUsers,
  },
];
const Main = () => {
    return(
        <section className="features-section">
        <div className="features-container">
          <h3 className="features-heading">Why Choose ZeroToCoder</h3>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon-container">
                    <Icon className="feature-icon" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    )
}

export default Main;
