import { useEffect } from "react";
import Vara from "vara";

const HandwrittenText = ({ text }) => {
  const id = "vara-container";

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = "";

    new Vara(
      `#${id}`, // ✅ STRING selector (THIS FIXES THE ERROR)
      "/fonts/b.json",
      [
        {
          text,
          y: 35,
          x:5,
          fromCurrentPosition: { y: false },
          duration: 2000
        }
      ],
      {
        strokeWidth: 2,
        color: "#ffffff"
      }
    );
  }, [text]);

  return <div id={id}></div>;
};

export default HandwrittenText;
