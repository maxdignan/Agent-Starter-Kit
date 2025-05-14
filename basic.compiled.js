const DocumentResearchAgent = () => {
    return (
React.createElement("Self", {prompt: "Research the document"}, React.createElement("DocumentResearchTool", {}, ))
)
}

const agent = (prompt) => {
    return (
React.createElement("Self", {prompt: "prompt"}, React.createElement("DocumentResearchAgent", {}, ), editFileTool, readFileTool)
)
}