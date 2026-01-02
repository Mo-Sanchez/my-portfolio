import image from "./images/profile.jpg";
import githubLogo from "./images/githublogo.png";
import linkedInLogo from "./images/linkedinicon.png";
import gmailicon from "./images/gmailicon.webp";


//import resume from "./Moises_Sanchez_Resume_SDE.pdf"

const githubLink: string = "https://github.com/Mo-Sanchez";
const linkedInLink: string = "https://www.linkedin.com/in/moises-sanchez-/";

const phantomSkyGithubLink: string = "https://github.com/Gator-Code-Studio/Phantom-Sky"
const phantomSkyDemoLink: string = "https://play.unity.com/en/games/eeb6d377-a0eb-4fdb-98dc-824a55133886/phantom-sky"

export default function App() {
  return (
    <main className="container">
      <header className="header">
        <div className="headerText">
          <h1>Moises Sanchez</h1>
          <p className="subtitle">Software Developer</p>

          <p className="bio">
            I like coding.
          </p>

<div className="ctaRow">
  <a
    className="btn"
    //href={resume}
    //download="Moises_Sanchez_Resume_SDE.pdf"
  >
    Resume
  </a>

  <div className="headerIcons">

        <a
      href={linkedInLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
    >
      <img src={linkedInLogo} alt="LinkedIn" />
    </a>
    <a
      href={githubLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
    >
      <img src={githubLogo} alt="GitHub" />
    </a>



        <a
      href="mailto:Moisessanchez6100@gmail.com"
      aria-label="Email"
    >
      <img src={gmailicon} alt="Email" />
    </a>
  </div>
</div>




         
        </div>

<div className="profileWrapper">
  <img className="profileImg" src={image} alt="Moises Sanchez profile" />
</div>
      </header>

      <section id="projects" className="section">
        <h2>Projects</h2>

        <div className="grid">
          <article className="card">
            <h3 className="cardTitle">MyMedia</h3>
            <p className="cardDesc">
              Work in progress.
            </p>
            <div className="cardMeta">
              <span className="pill">C#</span>
              <span className="pill">PostgreSQL</span>
            </div>
            <div className="cardLinks">
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Code
              </a>
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Demo
              </a>
            </div>
          </article>

          <article className="card">
            <h3 className="cardTitle">Phantom Sky</h3>
            <p className="cardDesc">
                2D samurai-inspired action platformer with fast movement and precision combat, built in Unity.            </p>
            <div className="cardMeta">
              <span className="pill">Unity</span>
              <span className="pill">C#</span>
            </div>
            <div className="cardLinks">
              <a href={phantomSkyGithubLink} target="_blank" rel="noopener noreferrer">
                Code
              </a>
              <a href={phantomSkyDemoLink} target="_blank" rel="noopener noreferrer">
                Demo
              </a>
            </div>
          </article>

          <article className="card">
            <h3 className="cardTitle">Aircraft Milestone Countdown Dashboard</h3>
            <p className="cardDesc">
              Real-time aircraft operations dashboard tracking critical milestones and countdowns for on-time departures.
            </p>
            <div className="cardMeta">
              <span className="pill">C#</span>
              <span className="pill">Blazor</span>
              <span className="pill">Supabase</span>
            </div>
            <div className="cardLinks">
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Code
              </a>
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Demo
              </a>
            </div>
          </article>


            {/*<article className="card">
            <h3 className="cardTitle">Project Four</h3>
            <p className="cardDesc">
              Short description of what it does, what you built, and the impact.
            </p>
            <div className="cardMeta">
              <span className="pill">Backend</span>
              <span className="pill">APIs</span>
            </div>
            <div className="cardLinks">
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Code
              </a>
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Demo
              </a>
            </div>
          </article>

          <article className="card">
            <h3 className="cardTitle">Project Five</h3>
            <p className="cardDesc">
              Short description of what it does, what you built, and the impact.
            </p>
            <div className="cardMeta">
              <span className="pill">Backend</span>
              <span className="pill">APIs</span>
            </div>
            <div className="cardLinks">
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Code
              </a>
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Demo
              </a>
            </div>
          </article>


                    <article className="card">
            <h3 className="cardTitle">Project Six</h3>
            <p className="cardDesc">
              Short description of what it does, what you built, and the impact.
            </p>
            <div className="cardMeta">
              <span className="pill">Backend</span>
              <span className="pill">APIs</span>
            </div>
            <div className="cardLinks">
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Code
              </a>
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                Demo
              </a>
            </div>
          </article> */}

        </div>
      </section>

<section className="section">
  <h2>Skills</h2>

  <div className="skills">
    <span className="pill backend">Java</span>
    <span className="pill backend">C#</span>
      <span className="pill backend">Python</span>

    <span className="pill frontend">React</span>
    <span className="pill frontend">TypeScript</span>

    <span className="pill database">SQL</span>
    <span className="pill database">PostgreSQL</span>
    <span className="pill database">MongoDB</span>


    <span className="pill tools">Git</span>
    <span className="pill tools">Docker</span>
    <span className="pill tools">AWS</span>

  </div>
</section>

<section className="section">
  <h2>Education</h2>

  <div className="educationTimeline">
    <div className="eduItem">
      <span className="eduDot" />
      <div className="eduContent">
        <strong>University of Florida</strong>
        <div className="eduMeta">B.S. Computer Science — December 2025</div>
      </div>
    </div>

    <div className="eduItem">
      <span className="eduDot" />
      <div className="eduContent">
        <strong>Polk State College</strong>
        <div className="eduMeta">Associate of Arts — December 2023</div>
      </div>
    </div>
  </div>
</section>



<section className="section">
  <h2>Certificates</h2>

  <ul className="certificates">
    <li>AWS Certified Cloud Practitioner — 2026</li>
    <li>Other Certification — Year</li>
  </ul>
</section>
      <footer className="footer">
        <p className="footerText">© {new Date().getFullYear()} Moises Sanchez</p>
      </footer>
    </main>
  );


  




  
}


