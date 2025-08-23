export default function AchievementCard({ achievement }) {
  const { title, desc, link, date } = achievement;
  return (
    <article className="achievement card">
      <h3 className="ach-title">{title}</h3>
      <p className="ach-desc">{desc}</p>
      <div className="ach-foot">
        <a href={link} target="_blank" rel="noreferrer" className="ach-link">
          GitHub / Project Link
        </a>
        {date && <span className="ach-date">{new Date(date).toLocaleDateString()}</span>}
      </div>
    </article>
  );
}
