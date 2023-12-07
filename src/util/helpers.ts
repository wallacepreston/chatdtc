export interface Suggestion {
    Category: string;
    Summary: string;
    Message_Content: string;
}
export const getCategories = (suggestedThreads: Suggestion[]) => {
    return suggestedThreads.reduce((categories: string[], thread) => {
        if (!categories.includes(thread.Category)) {
            categories.push(thread.Category);
        }
        return categories;
    }, []);
};
