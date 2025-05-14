const DocumentResearchAgent = () => {
    return (
        <Self prompt="Research the document">
            <DocumentResearchTool />
        </Self>
    )
}

const agent = (prompt) => {
    return (
        <Self prompt={prompt}>
            <DocumentResearchAgent />
            {editFileTool}
            {readFileTool}
        </Self>
    )
}