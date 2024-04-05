import React, { useState } from "react";

type PackageJson = {
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
};

const buttonTailwindClassesBlue =
  "text-nowrap ml-2 px-2 py-1 text-sm bg-blue-400 text-white rounded transition-transform hover:scale-105 hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 active:bg-blue-300";

const buttonTailwindClassesRed =
  "text-nowrap ml-2 px-2 py-1 text-sm bg-red-400 text-white rounded transition-transform hover:scale-105 hover:bg-red-500 focus:outline-none focus:ring focus:ring-red-300 active:bg-red-300";

const buttonTailwindClassesGray =
  "text-nowrap ml-2 px-2 py-1 text-sm bg-gray-400 text-white rounded transition-transform hover:scale-105 hover:bg-gray-500 focus:outline-none focus:ring focus:ring-blue-300 active:bg-gray-300";

const builtInDependencies: string[] = [
  // Add your list of built-in dependencies here
  "react",
  "react-dom",
  "lodash",
  // Add more if needed
];

function PackageJsonReader() {
  const [packageJsonContent, setPackageJsonContent] = useState<string>("");
  const [dependencies, setDependencies] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [devDependencies, setDevDependencies] = useState<{
    [key: string]: boolean;
  }>({});
  const [showContent, setShowContent] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Function to handle user input
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setPackageJsonContent(value);
    parsePackageJson(value);
    setShowContent(true);
  };

  // Function to handle file drop
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPackageJsonContent(content);
        parsePackageJson(content);
        setShowContent(true);
      };
      reader.readAsText(file);
    }
  };

  // Function to parse package.json content and extract dependencies
  const parsePackageJson = (content: string) => {
    try {
      const parsedJson: PackageJson = JSON.parse(content);

      const deps = Object.keys(parsedJson.dependencies || {}).reduce(
        (acc, dep) => {
          if (!builtInDependencies.includes(dep)) {
            acc[dep] = true;
          }
          return acc;
        },
        {} as { [key: string]: boolean }
      );

      const devDeps = Object.keys(parsedJson.devDependencies || {}).reduce(
        (acc, dep) => {
          if (!builtInDependencies.includes(dep)) {
            acc[dep] = true;
          }
          return acc;
        },
        {} as { [key: string]: boolean }
      );

      setDependencies(deps);
      setDevDependencies(devDeps);
    } catch (error) {
      // Handle parsing error
      console.error("Error parsing package.json:", error);
    }
  };

  // Function to handle dependency deletion
  const handleDeleteDependency = (
    dependency: string,
    isDevDependency: boolean
  ) => {
    if (isDevDependency) {
      setDevDependencies((prevDevDependencies) => ({
        ...prevDevDependencies,
        [dependency]: false,
      }));
    } else {
      setDependencies((prevDependencies) => ({
        ...prevDependencies,
        [dependency]: false,
      }));
    }
  };

  // Function to generate README.md content
  const generateReadmeContent = () => {
    const dependenciesList = Object.keys(dependencies)
      .filter((dep) => dependencies[dep])
      .map((dep) => `- ${dep}`)
      .join("\n");
    const devDependenciesList = Object.keys(devDependencies)
      .filter((dep) => devDependencies[dep])
      .map((dep) => `- ${dep}`)
      .join("\n");
    return `
# My Awesome Project

## Dependencies
${dependenciesList}

## Development Dependencies
${devDependenciesList}
`;
  };

  // Function to copy Markdown content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateReadmeContent());
  };

  // Function to save Markdown content as file
  const saveToFile = () => {
    const blob = new Blob([generateReadmeContent()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to handle paste from clipboard
  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setPackageJsonContent(text);
      parsePackageJson(text);
      setShowContent(true);
    });
  };

  // Function to handle drag over
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // Function to handle drag leave
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Function to handle drop zone click
  const handleDropZoneClick = () => {
    document.getElementById("fileInput")?.click();
  };

  return (
    <div className="flex flex-col h-screen">
      <div
        className={`flex-1 ${isDragging ? "bg-opacity-50" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        onClick={handleDropZoneClick}
      >
        <input
          id="fileInput"
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const content = e.target?.result as string;
                setPackageJsonContent(content);
                parsePackageJson(content);
                setShowContent(true);
              };
              reader.readAsText(file);
            }
          }}
        />
        <div className="flex items-center justify-center h-full bg-blue-400 text-white">
          <div className="border-2 border-dashed border-white p-12 flex flex-col text-center">
            <h1 className="text-2xl">Drag & Drop .json file here</h1>
            <p>or</p>
            <button className={buttonTailwindClassesGray}>Browse files</button>
          </div>
        </div>
      </div>
      <div className="flex bg-white p-8">
        <textarea
          className="w-full h-full p-4 border-2 border-gray-300 rounded bg-white"
          placeholder="Or paste your package.json content here..."
          value={packageJsonContent}
          onChange={handleInputChange}
        />
        <button className={buttonTailwindClassesBlue} onClick={handlePaste}>
          Paste .json
        </button>
      </div>
      {showContent && (
        <div className="flex-1 bg-white p-8">
          <div className="flex flex-wrap">
            <div className="w-full lg:w-1/2">
              <div>
                <h3 className="text-lg font-bold mb-2">Dependencies:</h3>
                <ul className="list-disc pl-6">
                  {Object.keys(dependencies).map(
                    (dep) =>
                      dependencies[dep] && (
                        <li
                          key={dep}
                          className="flex items-center justify-between hover:bg-gray-200"
                        >
                          {dep}
                          <button
                            className={buttonTailwindClassesRed}
                            onClick={() => handleDeleteDependency(dep, false)}
                          >
                            Delete
                          </button>
                        </li>
                      )
                  )}
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">
                  Development Dependencies:
                </h3>
                <ul className="list-disc pl-6">
                  {Object.keys(devDependencies).map(
                    (dep) =>
                      devDependencies[dep] && (
                        <li
                          key={dep}
                          className="flex items-center justify-between hover:bg-gray-200"
                        >
                          {dep}
                          <button
                            className={buttonTailwindClassesRed}
                            onClick={() => handleDeleteDependency(dep, true)}
                          >
                            Delete
                          </button>
                        </li>
                      )
                  )}
                </ul>
              </div>
            </div>
            <div className="w-full lg:w-1/2 lg:pl-8 mt-4 lg:mt-0 ">
              <div>
                <div className="flex justify-between">
                  <h3 className="text-lg font-bold mb-2">
                    Generated README.md
                  </h3>
                  <div>
                    <button
                      className={buttonTailwindClassesBlue}
                      onClick={copyToClipboard}
                    >
                      Copy Markdown
                    </button>
                    <button
                      className={buttonTailwindClassesBlue}
                      onClick={saveToFile}
                    >
                      Save as File
                    </button>
                  </div>
                </div>

                <pre className="border border-black/50 p-2 ">
                  {generateReadmeContent()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackageJsonReader;
