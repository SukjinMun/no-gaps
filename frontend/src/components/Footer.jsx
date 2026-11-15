import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__line">
          <span className="footer__brand">No Gaps</span> Mind the gap. We already did.
        </p>
        <p className="footer__credit">Made by Ale &amp; Suk</p>
      </div>
    </footer>
  );
}

Footer.propTypes = {};
