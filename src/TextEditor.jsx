import React, { useCallback, useEffect, useState } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import Cite from "citation-js";
import StickyBottomBar from "./StickyBottomBar";
import "./TextEditor.css";

const toolbarOptions = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [("bold", "italic", "underline")], // toggled buttons
  [{ list: "ordered" }, { list: "bullet" }], // dropdowns with defaults from theme
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["link", "image", "blockquote", "code-block"],
  ["clean"],
];

const TextEditor = () => {
  const [quill, setQuill] = useState();
  const initialHeading = "Climate Change Effect on Earth\n";

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    // return style clean up not available in useCallback :
    // reset all to an empty string
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
    });
    setQuill(q);
  }, []);

  useEffect(() => {
    if (quill) {
      quill.setContents([
        { insert: initialHeading, attributes: { header: 1 } },
        { insert: "Start writing...\n" },
      ]);
    }
  }, [quill]);

  // useEffect(() => {
  //   if (quill == null) return;
  //   const handler = (delta, oldDelta, source) => {
  //     console.log("delta", delta);
  //   };
  //   quill.on("text-change", handler);

  //   return () => quill.off("text-change", handler);
  // }, [quill]);

  const generateCite = (bibtex, format) => {
    const cite = new Cite(bibtex);
    const data = cite.format(format, {
      format: "text",
      template: "harvard",
      lang: "en-US",
    });
    // console.log("citation", data);
    return data;
  };

  const handleAddCitation = (bibtex, url) => {
    console.log(url);
    const citation = generateCite(bibtex, "citation");
    const reference = generateCite(bibtex, "bibliography");

    // Focus the editor, but don't scroll
    quill.focus({ preventScroll: true });

    const range = quill.getSelection();
    if (range !== null) {
      console.log("range.length", range.length);
      quill.insertText(range.index + range.length + 1, citation, "user");
      quill.formatText(
        range.index + range.length + 1,
        citation.length,
        "link",
        url
      );
    } else {
      quill.insertText(quill.getLength() + 1, citation, "user");
      quill.formatText(l, citation.length, "link", url);
    }
    quill.insertText(quill.getLength() + 1, `${reference}`, "user");
  };

  return (
    <div className="rcontainer flex justify-center align-center ">
      <StickyBottomBar
        heading={initialHeading}
        onAddCitation={(bibtex, url) => handleAddCitation(bibtex, url)}
      />
      <div className="container" ref={wrapperRef}></div>
    </div>
  );
};

export default TextEditor;
