export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    TypeScript: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Python: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Java: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "C#": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    PHP: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    Ruby: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    Go: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    Rust: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    Swift: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    Kotlin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    Dart: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    HTML: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    CSS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Shell: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  return colors[language] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
}