import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BarChart3,
  BookOpen,
  Cpu,
  Database,
  FileText,
  Globe,
  Smartphone,
  Terminal,
  X,
} from 'lucide-react';
import { useFileExplorerStore } from '../../stores/fileExplorerStore';


const getTemplateContentByLanguage = (
  languageId: string,
  templateId: string,
  fileName: string
): string => {
  const currentDate = new Date().toLocaleDateString();
  const componentName =
    fileName?.replace(/\.(tsx?|jsx?)$/, '').replace(/[^a-zA-Z0-9]/g, '') || 'Component';
  const className = componentName.charAt(0).toUpperCase() + componentName.slice(1);


  const templates: Record<string, Record<string, string>> = {

    latex: {
      basic: `\\documentclass{article}\n% ${fileName} - LaTeX Article\n% Created: ${currentDate}\n% Compile with: pdflatex ${fileName}.tex\n\n% Packages (Unified Font Stack)\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage{microtype}\n\\usepackage{geometry}\n\\usepackage{graphicx}\n\\usepackage{amsmath, amssymb}\n\\usepackage{hyperref}\n\\geometry{a4paper, margin=2.5cm}\n\n% Metadata\n\\title{${className} Title}\n\\author{Author Name}\\date{\\today}\n\n\\begin{document}\n\\maketitle\n\n\\begin{abstract}\nA short abstract describing the content.\n\\end{abstract}\n\n\\section{Introduction}\nYour introduction text here. Cite references like \\\\cite{knuth1984tex}.\n\n\\section{Methods}\nExplain your methodology.\n\n\\section{Results}\nPresent results, tables, figures. See Figure~\\ref{fig:sample}.\n\n\\begin{figure}[h]\n  \\centering\n  % \\includegraphics[width=0.6\\textwidth]{figure.png}\n  \\caption{Sample figure caption}\n  \\label{fig:sample}\n\\end{figure}\n\n\\section{Conclusion}\nSummarize findings and future work.\n\n% References (if not using BibTeX)\n% \\begin{thebibliography}{9}\n% \\bibitem{knuth1984tex} Donald E. Knuth. The TeXbook. 1984.\n% \\end{thebibliography}\n\n\\end{document}`,
      article: `\\documentclass[11pt,a4paper]{article}\n% ${fileName} - Article Template\n% Created: ${currentDate}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage{microtype}\n\\usepackage{geometry}\n\\usepackage{amsmath, amssymb, amsthm}\n\\usepackage{graphicx}\n\\usepackage{hyperref}\n\\usepackage{csquotes}\n\\geometry{margin=2.5cm}\n\\title{${className} Article}\n\\author{Author Name}\\date{\\today}\n\\newtheorem{theorem}{Theorem}\n\\begin{document}\n\\maketitle\n\\begin{abstract}\nAbstract text here.\n\\end{abstract}\n\\section{Introduction}\nContent...\n\\section{Main Results}\n\\begin{theorem}\nStatement.\n\\end{theorem}\n\\section{Conclusion}\nSummary.\n\\bibliographystyle{plain}\n\\bibliography{references}\n\\end{document}`,
      report: `\\documentclass[12pt]{report}\n% ${fileName} - Report Template\n% Created: ${currentDate}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage{microtype}\n\\usepackage{geometry}\n\\usepackage{hyperref}\n\\usepackage{graphicx}\n\\geometry{margin=3cm}\n\\title{${className} Report}\n\\author{Author Name}\\date{\\today}\n\\begin{document}\n\\maketitle\n\\tableofcontents\n\\chapter{Introduction}\n...\n\\chapter{Background}\n...\n\\chapter{Methodology}\n...\n\\chapter{Results}\n...\n\\chapter{Conclusion}\n...\n\\appendix\n\\chapter{Appendix}\nExtra material.\n\\end{document}`,
      beamer: `\\documentclass{beamer}\n% ${fileName} - Beamer Presentation\n% Created: ${currentDate}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage{microtype}\n\\usetheme{Madrid}\n\\usecolortheme{default}\n\\title{${className} Presentation}\n\\author{Author Name}\n\\date{\\today}\n\\begin{document}\n\\begin{frame}\n  \\titlepage\n\\end{frame}\n\\begin{frame}{Outline}\n  \\tableofcontents\n\\end{frame}\n\\section{Introduction}\n\\begin{frame}{Introduction}\n  Key points here.\n\\end{frame}\n\\section{Content}\n\\begin{frame}{Main Idea}\n  Explanation here.\n\\end{frame}\n\\section{Conclusion}\n\\begin{frame}{Conclusion}\n  Summary and future work.\n\\end{frame}\n\\end{document}`,
      book: `\\documentclass{book}\n% ${fileName} - Book Template\n% Created: ${currentDate}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage{microtype}\n\\usepackage{hyperref}\n\\title{${className} Book}\n\\author{Author Name}\n\\date{\\today}\n\\begin{document}\n\\frontmatter\n\\maketitle\n\\tableofcontents\n\\mainmatter\n\\chapter{Introduction}\n...\n\\chapter{Second Chapter}\n...\n\\backmatter\n\\chapter{Appendix}\n...\n\\end{document}`,
    },
    bibtex: {
      basic: `@book{knuth1984tex,\n  author    = {Donald E. Knuth},\n  title     = {The TeXbook},\n  year      = {1984},\n  publisher = {Addison-Wesley},\n  address   = {Reading, Massachusetts}\n}\n\n@article{einstein1905,\n  author  = {Albert Einstein},\n  title   = {On the Electrodynamics of Moving Bodies},\n  journal = {Annalen der Physik},\n  year    = {1905}\n}`,
    },
    javascript: {
      vanilla: `// ${fileName} - Created ${currentDate}\n\n// Main functionality\nfunction main() {\n    console.log('🚀 JavaScript script loaded');\n    \n    // Your code here\n    \n}\n\n// Execute\nmain();`,
      module: `// ${fileName} - ES6 Module\n// Created: ${currentDate}\n\nexport class ${className} {\n    constructor() {\n        this.initialize();\n    }\n    \n    initialize() {\n        console.log('Module initialized');\n    }\n}\n\nexport default ${className};`,
      node: `// ${fileName} - Node.js Script\n// Created: ${currentDate}\n\nconst path = require('path');\nconst fs = require('fs');\n\nclass ${className} {\n    constructor() {\n        this.start();\n    }\n    \n    start() {\n        console.log('Node.js application started');\n    }\n}\n\nconst app = new ${className}();\nmodule.exports = ${className};`,
      class: `// ${fileName} - ES6 Class\n// Created: ${currentDate}\n\nclass ${className} {\n    constructor(options = {}) {\n        this.options = options;\n        this.initialize();\n    }\n    \n    initialize() {\n        console.log('${className} initialized');\n    }\n    \n    // Add your methods here\n    \n}\n\nexport default ${className};`,
    },

    typescript: {
      basic: `// ${fileName} - TypeScript Module\n// Created: ${currentDate}\n\ninterface ${className}Options {\n    readonly name: string;\n    readonly version: string;\n}\n\nclass ${className} {\n    private options: ${className}Options;\n    \n    constructor(options: ${className}Options) {\n        this.options = options;\n        this.initialize();\n    }\n    \n    private initialize(): void {\n        console.log('TypeScript module initialized');\n    }\n}\n\nexport default ${className};\nexport type { ${className}Options };`,
  module: `// ${fileName} - TypeScript Module\n// Created: ${currentDate}\n\nexport interface I${className} {\n    id: string;\n    name: string;\n    createdAt: Date;\n}\n\nexport class ${className} implements I${className} {\n    public readonly id: string;\n    public name: string;\n    public readonly createdAt: Date;\n    \n    constructor(name: string) {\n        // SSR/legacy-safe UUID generation without external helpers\n        const __id = (typeof globalThis !== 'undefined' && (globalThis as any).crypto && typeof (globalThis as any).crypto.randomUUID === 'function')\n          ? (globalThis as any).crypto.randomUUID()\n          : (Date.now().toString() + '-' + Math.random().toString(36).slice(2));\n        this.id = __id;\n        this.name = name;\n        this.createdAt = new Date();\n    }\n}\n\nexport default ${className};`,
      class: `// ${fileName} - TypeScript Class\n// Created: ${currentDate}\n\nabstract class Base${className} {\n    protected abstract initialize(): void;\n}\n\nexport class ${className} extends Base${className} {\n    private _isInitialized = false;\n    \n    constructor() {\n        super();\n        this.initialize();\n    }\n    \n    protected initialize(): void {\n        this._isInitialized = true;\n        console.log('${className} initialized');\n    }\n    \n    public get isInitialized(): boolean {\n        return this._isInitialized;\n    }\n}\n\nexport default ${className};`,
      interface: `// ${fileName} - TypeScript Interface\n// Created: ${currentDate}\n\nexport interface I${className} {\n    readonly id: string;\n    name: string;\n    description?: string;\n    createdAt: Date;\n    updatedAt?: Date;\n}\n\nexport interface I${className}Service {\n    create(data: Omit<I${className}, 'id' | 'createdAt'>): Promise<I${className}>;\n    findById(id: string): Promise<I${className} | null>;\n    update(id: string, data: Partial<I${className}>): Promise<I${className}>;\n    delete(id: string): Promise<boolean>;\n}\n\nexport type ${className}CreateRequest = Omit<I${className}, 'id' | 'createdAt' | 'updatedAt'>;\nexport type ${className}UpdateRequest = Partial<${className}CreateRequest>;`,
    },

    react: {
      component: `// ${fileName} - React Component\n// Created: ${currentDate}\n\nimport React from 'react';\n\ninterface ${className}Props {\n    className?: string;\n    children?: React.ReactNode;\n}\n\nconst ${className}: React.FC<${className}Props> = ({ className, children }) => {\n    return (\n        <div className={className}>\n            <h1>${className}</h1>\n            {children}\n        </div>\n    );\n};\n\nexport default ${className};`,
      hook: `// ${fileName} - Custom React Hook\n// Created: ${currentDate}\n\nimport { useState, useEffect, useCallback } from 'react';\n\ninterface Use${className}Options {\n    initialValue?: any;\n}\n\ninterface Use${className}Return {\n    value: any;\n    setValue: (value: any) => void;\n    reset: () => void;\n    isLoading: boolean;\n}\n\nexport const use${className} = (options: Use${className}Options = {}): Use${className}Return => {\n    const [value, setValue] = useState(options.initialValue);\n    const [isLoading, setIsLoading] = useState(false);\n    \n    const reset = useCallback(() => {\n        setValue(options.initialValue);\n    }, [options.initialValue]);\n    \n    useEffect(() => {\n        // Effect logic here\n    }, []);\n    \n    return {\n        value,\n        setValue,\n        reset,\n        isLoading\n    };\n};\n\nexport default use${className};`,
      page: `// ${fileName} - React Page Component\n// Created: ${currentDate}\n\nimport React, { useEffect } from 'react';\nimport { Helmet } from 'react-helmet-async';\n\ninterface ${className}Props {\n    // Props here\n}\n\nconst ${className}: React.FC<${className}Props> = () => {\n    useEffect(() => {\n        // Page initialization\n    }, []);\n    \n    return (\n        <>\n            <Helmet>\n                <title>${className}</title>\n                <meta name=\"description\" content=\"${className} page\" />\n            </Helmet>\n            \n            <main className=\"container mx-auto px-4 py-8\">\n                <h1 className=\"text-3xl font-bold mb-6\">${className}</h1>\n                \n                {}\n                \n            </main>\n        </>\n    );\n};\n\nexport default ${className};`,
      context: `// ${fileName} - React Context\n// Created: ${currentDate}\n\nimport React, { createContext, useContext, useReducer, ReactNode } from 'react';\n\ninterface ${className}State {\n    // State properties\n}\n\ninterface ${className}Actions {\n    // Action types\n}\n\nconst initial${className}State: ${className}State = {\n    // Initial state\n};\n\nconst ${className}Context = createContext<{\n    state: ${className}State;\n    dispatch: React.Dispatch<${className}Actions>;\n} | null>(null);\n\nfunction ${className.toLowerCase()}Reducer(state: ${className}State, action: ${className}Actions): ${className}State {\n    switch (action.type) {\n        default:\n            return state;\n    }\n}\n\nexport const ${className}Provider: React.FC<{ children: ReactNode }> = ({ children }) => {\n    const [state, dispatch] = useReducer(${className.toLowerCase()}Reducer, initial${className}State);\n    \n    return (\n        <${className}Context.Provider value={{ state, dispatch }}>\n            {children}\n        </${className}Context.Provider>\n    );\n};\n\nexport const use${className} = () => {\n    const context = useContext(${className}Context);\n    if (!context) {\n        throw new Error('use${className} must be used within ${className}Provider');\n    }\n    return context;\n};\n\nexport default ${className}Provider;`,
    },

    python: {
      script: `#!/usr/bin/env python3\n# ${fileName} - Python Script\n# Created: ${currentDate}\n\nimport os\nimport sys\nfrom datetime import datetime\n\ndef main():\n    \"\"\"Main function\"\"\"\n    print(f\"🐍 Python script started: {datetime.now()}\")\n    \n    # Your code here\n    \n    print(\"Script completed successfully!\")\n\nif __name__ == \"__main__\":\n    main()`,
      class: `#!/usr/bin/env python3\n# ${fileName} - Python Class Module\n# Created: ${currentDate}\n\nfrom datetime import datetime\nfrom typing import Optional, Dict, Any\n\nclass ${className}:\n    \"\"\"${className} class for handling operations\"\"\"\n    \n    def __init__(self, name: str, **kwargs):\n        self.name = name\n        self.created_at = datetime.now()\n        self.config = kwargs\n        self._initialize()\n    \n    def _initialize(self) -> None:\n        \"\"\"Initialize the instance\"\"\"\n        print(f\"Initializing {self.__class__.__name__}: {self.name}\")\n    \n    def __str__(self) -> str:\n        return f\"{self.__class__.__name__}(name='{self.name}', created={self.created_at})\"\n    \n    def __repr__(self) -> str:\n        return self.__str__()\n\n# Example usage\nif __name__ == \"__main__\":\n    instance = ${className}(\"example\")\n    print(instance)`,
      flask: `#!/usr/bin/env python3\n# ${fileName} - Flask Application\n# Created: ${currentDate}\n\nfrom flask import Flask, request, jsonify\nfrom datetime import datetime\nimport os\n\napp = Flask(__name__)\napp.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key')\n\n@app.route('/')\ndef index():\n    return jsonify({\n        'message': 'Flask app is running!',\n        'timestamp': datetime.now().isoformat(),\n        'app': '${className}'\n    })\n\n@app.route('/api/health')\ndef health_check():\n    return jsonify({'status': 'healthy', 'service': '${className}'})\n\n@app.errorhandler(404)\ndef not_found(error):\n    return jsonify({'error': 'Not found'}), 404\n\nif __name__ == '__main__':\n    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'\n    port = int(os.environ.get('PORT', 5000))\n    app.run(debug=debug_mode, host='0.0.0.0', port=port)`,
      fastapi: `#!/usr/bin/env python3\n# ${fileName} - FastAPI Application\n# Created: ${currentDate}\n\nfrom fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\nfrom datetime import datetime\nfrom typing import List, Optional\nimport uvicorn\n\napp = FastAPI(\n    title=\"${className} API\",\n    description=\"FastAPI application generated by Enhanced IDE\",\n    version=\"1.0.0\"\n)\n\nclass ${className}Model(BaseModel):\n    id: Optional[int] = None\n    name: str\n    description: Optional[str] = None\n    created_at: Optional[datetime] = None\n\n@app.get(\"/\")\nasync def root():\n    return {\n        \"message\": \"${className} FastAPI is running!\",\n        \"timestamp\": datetime.now(),\n        \"docs\": \"/docs\"\n    }\n\n@app.get(\"/health\")\nasync def health_check():\n    return {\"status\": \"healthy\", \"service\": \"${className}\"}\n\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"0.0.0.0\", port=8000, reload=True)`,
      django: `# ${fileName} - Django Application\n# Created: ${currentDate}\n\nfrom django.http import JsonResponse\nfrom django.views import View\nfrom django.views.decorators.csrf import csrf_exempt\nfrom django.utils.decorators import method_decorator\nfrom datetime import datetime\nimport json\n\n@method_decorator(csrf_exempt, name='dispatch')\nclass ${className}View(View):\n    \"\"\"${className} Django view\"\"\"\n    \n    def get(self, request):\n        return JsonResponse({\n            'message': 'Django view is working!',\n            'timestamp': datetime.now().isoformat(),\n            'view': '${className}View'\n        })\n    \n    def post(self, request):\n        try:\n            data = json.loads(request.body)\n            # Process data here\n            return JsonResponse({\n                'success': True,\n                'data': data,\n                'processed_at': datetime.now().isoformat()\n            })\n        except Exception as e:\n            return JsonResponse({\n                'success': False,\n                'error': str(e)\n            }, status=400)\n\n# URL patterns (add to urls.py)\n# path('${componentName.toLowerCase()}/', ${className}View.as_view(), name='${componentName.toLowerCase()}')`,
    },


    html: {
      basic: `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>${componentName}</title>\n    <style>\n        body {\n            font-family: system-ui, -apple-system, sans-serif;\n            margin: 0;\n            padding: 2rem;\n            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            min-height: 100vh;\n        }\n        .container {\n            max-width: 1200px;\n            margin: 0 auto;\n            background: white;\n            border-radius: 12px;\n            padding: 2rem;\n            box-shadow: 0 20px 40px rgba(0,0,0,0.1);\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <h1>Welcome to ${componentName}</h1>\n        <p>Created: ${currentDate}</p>\n        <!-- Your content here -->\n    </div>\n</body>\n</html>`,
    },

    css: {
      basic: `\n\n\n:root {\n    --primary-color: #667eea;\n    --secondary-color: #764ba2;\n    --text-color: #333;\n    --background-color: #fff;\n    --border-radius: 8px;\n    --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n}\n\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\nbody {\n    font-family: system-ui, -apple-system, sans-serif;\n    color: var(--text-color);\n    background: var(--background-color);\n    line-height: 1.6;\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n    padding: 0 1rem;\n}\n\n`,
    },


    plain: {
      basic: `${fileName}\nCreated: ${currentDate}\n\n=== ${componentName} ===\n\nDescription:\nYour content goes here...\n\nNotes:\n- \n- \n- \n\n---\nGenerated by Enhanced IDE`,
    },
  };

  return (
    templates[languageId]?.[templateId] ||
    `// ${fileName}\n// Created: ${currentDate}\n\n// Your code here...`
  );
};


const LANGUAGE_CATEGORIES = {
  web: {
    name: 'Web Development',
    icon: Globe,
    color: '#3B82F6',
    languages: [
      { id: 'html', name: 'HTML', extension: 'html', description: 'Markup language for web pages' },
      { id: 'css', name: 'CSS', extension: 'css', description: 'Styling for web applications' },
      {
        id: 'scss',
        name: 'SCSS/Sass',
        extension: 'scss',
        description: 'CSS preprocessor with variables',
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        extension: 'js',
        description: 'Dynamic web programming',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        extension: 'ts',
        description: 'Type-safe JavaScript',
      },
      {
        id: 'react',
        name: 'React/JSX',
        extension: 'tsx',
        description: 'React components and hooks',
      },
      { id: 'vue', name: 'Vue.js', extension: 'vue', description: 'Progressive web framework' },
      { id: 'angular', name: 'Angular', extension: 'ts', description: 'Enterprise web framework' },
      { id: 'svelte', name: 'Svelte', extension: 'svelte', description: 'Compiled web framework' },
    ],
  },
  backend: {
    name: 'Backend Development',
    icon: Database,
    color: '#10B981',
    languages: [
      { id: 'python', name: 'Python', extension: 'py', description: 'General-purpose programming' },
      { id: 'java', name: 'Java', extension: 'java', description: 'Enterprise applications' },
      { id: 'csharp', name: 'C#', extension: 'cs', description: '.NET development' },
      { id: 'cpp', name: 'C++', extension: 'cpp', description: 'System programming' },
      { id: 'c', name: 'C', extension: 'c', description: 'Low-level programming' },
      { id: 'go', name: 'Go', extension: 'go', description: 'Cloud-native development' },
      { id: 'rust', name: 'Rust', extension: 'rs', description: 'Memory-safe systems programming' },
      { id: 'php', name: 'PHP', extension: 'php', description: 'Server-side web development' },
      { id: 'ruby', name: 'Ruby', extension: 'rb', description: 'Dynamic programming language' },
      { id: 'kotlin', name: 'Kotlin', extension: 'kt', description: 'Modern JVM language' },
      { id: 'scala', name: 'Scala', extension: 'scala', description: 'Functional JVM language' },
      { id: 'nodejs', name: 'Node.js', extension: 'js', description: 'Server-side JavaScript' },
    ],
  },
  mobile: {
    name: 'Mobile Development',
    icon: Smartphone,
    color: '#8B5CF6',
    languages: [
      { id: 'swift', name: 'Swift', extension: 'swift', description: 'iOS development' },
      {
        id: 'objectivec',
        name: 'Objective-C',
        extension: 'm',
        description: 'Legacy iOS development',
      },
      { id: 'dart', name: 'Dart/Flutter', extension: 'dart', description: 'Cross-platform mobile' },
      {
        id: 'reactnative',
        name: 'React Native',
        extension: 'tsx',
        description: 'React for mobile',
      },
    ],
  },
  data: {
    name: 'Data Science & ML',
    icon: BarChart3,
  color: '#00A6D7',
    languages: [
      { id: 'python', name: 'Python', extension: 'py', description: 'Data science and ML' },
      { id: 'r', name: 'R', extension: 'r', description: 'Statistical computing' },
      { id: 'matlab', name: 'MATLAB', extension: 'm', description: 'Technical computing' },
      { id: 'julia', name: 'Julia', extension: 'jl', description: 'High-performance computing' },
    ],
  },
  database: {
    name: 'Database & Query',
    icon: Database,
    color: '#06B6D4',
    languages: [
      { id: 'sql', name: 'SQL', extension: 'sql', description: 'Database queries' },
      {
        id: 'postgresql',
        name: 'PostgreSQL',
        extension: 'sql',
        description: 'Advanced SQL database',
      },
      { id: 'mysql', name: 'MySQL', extension: 'sql', description: 'Popular SQL database' },
      { id: 'mongodb', name: 'MongoDB', extension: 'js', description: 'NoSQL database queries' },
    ],
  },
  devops: {
    name: 'DevOps & Config',
    icon: Terminal,
    color: '#84CC16',
    languages: [
      { id: 'bash', name: 'Bash/Shell', extension: 'sh', description: 'Unix shell scripting' },
      { id: 'powershell', name: 'PowerShell', extension: 'ps1', description: 'Windows automation' },
      { id: 'yaml', name: 'YAML', extension: 'yml', description: 'Configuration files' },
      { id: 'json', name: 'JSON', extension: 'json', description: 'Data interchange format' },
      {
        id: 'dockerfile',
        name: 'Dockerfile',
        extension: 'dockerfile',
        description: 'Container configuration',
      },
      {
        id: 'terraform',
        name: 'Terraform',
        extension: 'tf',
        description: 'Infrastructure as code',
      },
    ],
  },
  functional: {
    name: 'Functional Languages',
    icon: BookOpen,
    color: '#EC4899',
    languages: [
      {
        id: 'haskell',
        name: 'Haskell',
        extension: 'hs',
        description: 'Pure functional programming',
      },
      { id: 'erlang', name: 'Erlang', extension: 'erl', description: 'Concurrent programming' },
      { id: 'elixir', name: 'Elixir', extension: 'ex', description: 'Modern Erlang' },
      { id: 'clojure', name: 'Clojure', extension: 'clj', description: 'Lisp on JVM' },
    ],
  },
  system: {
    name: 'System Programming',
    icon: Cpu,
    color: '#6B7280',
    languages: [
      {
        id: 'assembly',
        name: 'Assembly',
        extension: 'asm',
        description: 'Low-level system programming',
      },
      { id: 'c', name: 'C', extension: 'c', description: 'System programming' },
      {
        id: 'cpp',
        name: 'C++',
        extension: 'cpp',
        description: 'System and application programming',
      },
      { id: 'rust', name: 'Rust', extension: 'rs', description: 'Memory-safe systems programming' },
    ],
  },
  config: {
    name: 'Config & Documentation',
    icon: FileText,
    color: '#64748B',
    languages: [
      { id: 'markdown', name: 'Markdown', extension: 'md', description: 'Documentation and notes' },
      { id: 'plain', name: 'Plain Text', extension: 'txt', description: 'Simple text files' },
      { id: 'xml', name: 'XML', extension: 'xml', description: 'Markup language' },
      { id: 'toml', name: 'TOML', extension: 'toml', description: 'Configuration format' },
      { id: 'ini', name: 'INI', extension: 'ini', description: 'Configuration files' },
    ],
  },
  latexdocs: {
    name: 'LaTeX & Papers',
    icon: FileText,
    color: '#C084FC',
    languages: [
      {
        id: 'latex',
        name: 'LaTeX',
        extension: 'tex',
        description: 'Scientific typesetting language',
      },
      { id: 'bibtex', name: 'BibTeX', extension: 'bib', description: 'Bibliography database' },
    ],
  },
};


const TEMPLATE_TYPES = {

  javascript: [
    { id: 'vanilla', name: 'Vanilla JS', description: 'Pure JavaScript without frameworks' },
    { id: 'module', name: 'ES6 Module', description: 'Modern JavaScript module' },
    { id: 'node', name: 'Node.js Script', description: 'Server-side JavaScript' },
    { id: 'class', name: 'ES6 Class', description: 'Object-oriented JavaScript' },
  ],
  typescript: [
    { id: 'basic', name: 'Basic TypeScript', description: 'Type-safe JavaScript' },
    { id: 'module', name: 'TS Module', description: 'TypeScript module with types' },
    { id: 'class', name: 'TypeScript Class', description: 'OOP with TypeScript' },
    { id: 'interface', name: 'Interface Definition', description: 'Type definitions' },
  ],
  react: [
    { id: 'component', name: 'Functional Component', description: 'React functional component' },
    { id: 'hook', name: 'Custom Hook', description: 'Reusable React hook' },
    { id: 'page', name: 'Page Component', description: 'Full page component' },
    { id: 'context', name: 'Context Provider', description: 'React context' },
  ],
  vue: [
    { id: 'sfc', name: 'Single File Component', description: 'Vue SFC with Composition API' },
    { id: 'composable', name: 'Composable', description: 'Vue 3 composable function' },
    { id: 'store', name: 'Pinia Store', description: 'State management' },
  ],


  python: [
    { id: 'script', name: 'Python Script', description: 'Basic Python script' },
    { id: 'class', name: 'Class Module', description: 'Object-oriented Python' },
    { id: 'flask', name: 'Flask App', description: 'Web application with Flask' },
    { id: 'fastapi', name: 'FastAPI App', description: 'Modern Python API' },
    { id: 'django', name: 'Django App', description: 'Django application' },
  ],
  java: [
    { id: 'class', name: 'Java Class', description: 'Java class with main method' },
    { id: 'interface', name: 'Interface', description: 'Java interface definition' },
    { id: 'spring', name: 'Spring Boot', description: 'Spring Boot application' },
    { id: 'servlet', name: 'Servlet', description: 'Web servlet' },
  ],
  go: [
    { id: 'main', name: 'Main Package', description: 'Go main package' },
    { id: 'package', name: 'Package', description: 'Go package' },
    { id: 'web', name: 'Web Server', description: 'HTTP server' },
    { id: 'cli', name: 'CLI Tool', description: 'Command line tool' },
  ],
  rust: [
    { id: 'main', name: 'Main Binary', description: 'Rust main binary' },
    { id: 'lib', name: 'Library', description: 'Rust library' },
    { id: 'web', name: 'Web Server', description: 'Axum/Warp web server' },
  ],


  cpp: [
    { id: 'main', name: 'Main Function', description: 'C++ with main function' },
    { id: 'class', name: 'Class Definition', description: 'C++ class' },
    { id: 'header', name: 'Header File', description: 'C++ header file' },
  ],
  c: [
    { id: 'main', name: 'Main Function', description: 'C with main function' },
    { id: 'header', name: 'Header File', description: 'C header file' },
  ],


  swift: [
    { id: 'app', name: 'iOS App', description: 'SwiftUI app' },
    { id: 'view', name: 'SwiftUI View', description: 'UI component' },
    { id: 'model', name: 'Data Model', description: 'Swift data model' },
  ],
  dart: [
    { id: 'app', name: 'Flutter App', description: 'Flutter application' },
    { id: 'widget', name: 'Widget', description: 'Flutter widget' },
    { id: 'model', name: 'Data Model', description: 'Dart data model' },
  ],


  html: [{ id: 'basic', name: 'HTML Page', description: 'Complete HTML document' }],
  css: [{ id: 'basic', name: 'CSS Stylesheet', description: 'CSS styles and layouts' }],
  scss: [{ id: 'basic', name: 'SCSS Stylesheet', description: 'SCSS with variables and mixins' }],
  csharp: [{ id: 'basic', name: 'C# Class', description: 'C# class with namespace' }],
  php: [{ id: 'basic', name: 'PHP Script', description: 'PHP web script' }],
  ruby: [{ id: 'basic', name: 'Ruby Script', description: 'Ruby script' }],
  kotlin: [{ id: 'basic', name: 'Kotlin Class', description: 'Kotlin class' }],
  scala: [{ id: 'basic', name: 'Scala Object', description: 'Scala object' }],
  sql: [{ id: 'basic', name: 'SQL Query', description: 'SQL database query' }],
  bash: [{ id: 'basic', name: 'Shell Script', description: 'Bash shell script' }],
  powershell: [
    { id: 'basic', name: 'PowerShell Script', description: 'Windows PowerShell script' },
  ],
  yaml: [{ id: 'basic', name: 'YAML Config', description: 'YAML configuration file' }],
  json: [{ id: 'basic', name: 'JSON Data', description: 'Structured data format' }],
  markdown: [{ id: 'basic', name: 'Markdown Doc', description: 'Documentation template' }],
  plain: [{ id: 'basic', name: 'Text File', description: 'Plain text document' }],
  latex: [
    { id: 'basic', name: 'Basic Article', description: 'Minimal article template' },
    { id: 'article', name: 'Article', description: 'Academic article structure' },
    { id: 'report', name: 'Report', description: 'Report / thesis structure' },
    { id: 'beamer', name: 'Beamer Slides', description: 'Presentation slides' },
    { id: 'book', name: 'Book', description: 'Book document class' },
  ],
  bibtex: [{ id: 'basic', name: 'BibTeX DB', description: 'Sample bibliography entries' }],
  r: [{ id: 'basic', name: 'R Script', description: 'R statistical script' }],
  haskell: [{ id: 'basic', name: 'Haskell Module', description: 'Haskell functional module' }],
  assembly: [{ id: 'basic', name: 'Assembly Code', description: 'Assembly language code' }],
};

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFile: (language?: string, template?: string, fileName?: string) => void;
  sidebarWidth: number;
}

const NewFileModal: React.FC<NewFileModalProps> = ({
  isOpen,
  onClose,
  onCreateFile,
  sidebarWidth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('web');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [step, setStep] = useState<'category' | 'language' | 'template' | 'filename'>('category');
  const inputRef = useRef<HTMLInputElement>(null);
  const files = useFileExplorerStore(s => s.files);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedLanguage('');
    setSelectedTemplate('');
    setStep('language');
  }, []);

  const handleLanguageSelect = useCallback((languageId: string) => {
    setSelectedLanguage(languageId);
    setSelectedTemplate('');
    const templates = TEMPLATE_TYPES[languageId as keyof typeof TEMPLATE_TYPES];
    if (templates && templates.length > 1) {
      setStep('template');
    } else {
      setSelectedTemplate(templates?.[0]?.id || 'basic');
      setStep('filename');
    }
  }, []);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    setStep('filename');
  }, []);


  const currentCategory = LANGUAGE_CATEGORIES[selectedCategory as keyof typeof LANGUAGE_CATEGORIES];
  const currentLanguage = currentCategory?.languages.find(lang => lang.id === selectedLanguage);
  const expectedExt = `.${currentLanguage?.extension || 'txt'}`;
  const baseName = (fileName || '').trim();
  const finalNamePreview = (baseName.length ? baseName : 'untitled') + expectedExt;
  const rootSiblings = useMemo(
    () => (files || []).filter(f => !f.path.includes('/')).map(f => f.name),
    [files]
  );
  const isDuplicate = rootSiblings.includes(finalNamePreview);
  const validationError = useMemo(() => {
    if (step !== 'filename') return '';
    if (!baseName.length) return 'Enter a file name.';
    if (!/[a-zA-Z0-9]/.test(baseName)) return 'Use letters or numbers in the file name.';
    if (/[\\/]/.test(baseName)) return 'File name cannot contain / or \\';
    if (!selectedLanguage) return 'Choose a language.';
    if (isDuplicate) return `A file named "${finalNamePreview}" already exists.`;
    return '';
  }, [baseName, selectedLanguage, isDuplicate, finalNamePreview, step]);


  useEffect(() => {
    if (isOpen && step === 'filename') {
      const id = requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [isOpen, step]);

  const handleCreate = useCallback(() => {
    if (!selectedLanguage) return;
    if (validationError) return;


    const baseOnly = fileName && fileName.trim().length > 0 ? fileName.trim() : 'untitled';
    const finalFileName = baseOnly;


    const templateContent = getTemplateContentByLanguage(
      selectedLanguage,
      selectedTemplate,
      finalFileName
    );


    onCreateFile(selectedLanguage, templateContent, finalFileName);


    setSelectedCategory('web');
    setSelectedLanguage('');
    setSelectedTemplate('');
    setFileName('');
    setStep('category');
    onClose();
  }, [selectedLanguage, selectedTemplate, fileName, onCreateFile, onClose, validationError]);

  const handleBack = useCallback(() => {
    switch (step) {
      case 'language':
        setStep('category');
        break;
      case 'template':
        setStep('language');
        break;
      case 'filename':
        const templates = TEMPLATE_TYPES[selectedLanguage as keyof typeof TEMPLATE_TYPES];
        if (templates && templates.length > 1) {
          setStep('template');
        } else {
          setStep('language');
        }
        break;
    }
  }, [step, selectedLanguage]);

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      zIndex: 1000000,
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? ('visible' as const) : ('hidden' as const),
      transition: 'opacity 0.3s ease, visibility 0.3s ease',
    },

    modal: {
      width: Math.min(sidebarWidth * 1.8, 600),
      maxHeight: '80vh',
      background: `linear-gradient(145deg,
        rgba(37, 37, 37, 0.95) 0%,
        rgba(18, 18, 18, 0.98) 100%)`,
  backdropFilter: 'blur(16px)',
      border: '1px solid #3a3a3a',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: `
        0 12px 32px rgba(0, 0, 0, 0.5),
        0 4px 16px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(194, 167, 110, 0.1)`,
      color: '#e8e8e8',
      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
      transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column' as const,
    },

    header: {
      padding: '20px 24px 16px',
      borderBottom: '1px solid #333333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(194, 167, 110, 0.05)',
    },

    title: {
      fontSize: '18px',
      fontWeight: 600,
  color: '#00a6d7',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },

    closeButton: {
      width: '32px',
      height: '32px',
      background: 'transparent',
      border: 'none',
      color: '#888888',
      cursor: 'pointer',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: 'rgba(194, 167, 110, 0.15)',
  color: '#00a6d7',
      },
    },

    content: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto' as const,
      maxHeight: 'calc(80vh - 140px)',
    },

    navigation: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      fontSize: '13px',
      color: '#b8b8b8',
    },

    navStep: {
      padding: '4px 8px',
      borderRadius: '4px',
      background: 'rgba(194, 167, 110, 0.1)',
  color: '#00a6d7',
    },

    navArrow: {
      color: '#666666',
    },

    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px',
      marginBottom: '20px',
    },

    categoryCard: {
      padding: '16px',
      background: 'linear-gradient(145deg, rgba(37, 37, 37, 0.8) 0%, rgba(18, 18, 18, 0.9) 100%)',
      border: '1px solid #3a3a3a',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        background:
          'linear-gradient(145deg, rgba(194, 167, 110, 0.1) 0%, rgba(37, 37, 37, 0.9) 100%)',
  borderColor: '#00a6d7',
        transform: 'translateY(-2px)',
      },
    },

    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
    },

    categoryIcon: {
      width: '20px',
      height: '20px',
    },

    categoryName: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#e8e8e8',
    },

    languageList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '10px',
    },

    languageItem: {
      padding: '12px 16px',
      background: 'rgba(37, 37, 37, 0.6)',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: 'rgba(194, 167, 110, 0.1)',
  borderColor: '#00a6d7',
      },
    },

    languageName: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#e8e8e8',
      marginBottom: '4px',
    },

    languageDesc: {
      fontSize: '12px',
      color: '#b8b8b8',
      lineHeight: 1.4,
    },

    templateList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    },

    templateItem: {
      padding: '12px 16px',
      background: 'rgba(37, 37, 37, 0.6)',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: 'rgba(194, 167, 110, 0.1)',
  borderColor: '#00a6d7',
      },
    },

    fileNameInput: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(37, 37, 37, 0.8)',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#e8e8e8',
      fontSize: '14px',
      fontFamily: 'inherit',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      '&:focus': {
  borderColor: '#00a6d7',
      },
    },

    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #333333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(18, 18, 18, 0.5)',
    },

    button: {
      padding: '8px 16px',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      background: 'rgba(37, 37, 37, 0.8)',
      color: '#e8e8e8',
      fontSize: '13px',
      fontFamily: 'inherit',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: 'rgba(194, 167, 110, 0.1)',
  borderColor: '#00a6d7',
      },
    },

    primaryButton: {
  background: 'linear-gradient(145deg, #00a6d7 0%, #036E8D 100%)',
      color: '#1a1a1a',
      fontWeight: 600,
      '&:hover': {
  background: 'linear-gradient(145deg, #5FD6F5 0%, #00a6d7 100%)',
        transform: 'translateY(-1px)',
      },
    },
  };


  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTemplates = selectedLanguage
    ? TEMPLATE_TYPES[selectedLanguage as keyof typeof TEMPLATE_TYPES] || []
    : [];

  const modalContent = (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create New File"
    >
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.title}>
            <FileText size={20} />
            Create New File
          </div>
          <button style={styles.closeButton} onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div style={styles.content}>
          {}
          <div style={styles.navigation}>
            <span style={step === 'category' ? styles.navStep : {}}>Category</span>
            {step !== 'category' && (
              <>
                <span style={styles.navArrow}>→</span>
                <span style={step === 'language' ? styles.navStep : {}}>Language</span>
              </>
            )}
            {(step === 'template' || step === 'filename') && currentTemplates.length > 1 && (
              <>
                <span style={styles.navArrow}>→</span>
                <span style={step === 'template' ? styles.navStep : {}}>Template</span>
              </>
            )}
            {step === 'filename' && (
              <>
                <span style={styles.navArrow}>→</span>
                <span style={styles.navStep}>File Name</span>
              </>
            )}
          </div>

          {}
          {step === 'category' && (
            <div style={styles.categoryGrid}>
              {Object.entries(LANGUAGE_CATEGORIES).map(([categoryId, category]) => (
                <div
                  key={categoryId}
                  style={styles.categoryCard}
                  onClick={() => handleCategorySelect(categoryId)}
                >
                  <div style={styles.categoryHeader}>
                    <category.icon size={20} style={{ color: category.color }} />
                    <span style={styles.categoryName}>{category.name}</span>
                  </div>
                  <div style={styles.languageDesc}>
                    {category.languages.length} languages available
                  </div>
                </div>
              ))}
            </div>
          )}

          {}
          {step === 'language' && currentCategory ? <div style={styles.languageList}>
              {currentCategory.languages.map(language => (
                <div
                  key={language.id}
                  style={styles.languageItem}
                  onClick={() => handleLanguageSelect(language.id)}
                >
                  <div style={styles.languageName}>{language.name}</div>
                  <div style={styles.languageDesc}>{language.description}</div>
                </div>
              ))}
            </div> : null}

          {}
          {step === 'template' && currentTemplates.length > 0 && (
            <div style={styles.templateList}>
              {currentTemplates.map(template => (
                <div
                  key={template.id}
                  style={styles.templateItem}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div style={styles.languageName}>{template.name}</div>
                  <div style={styles.languageDesc}>{template.description}</div>
                </div>
              ))}
            </div>
          )}

          {}
          {step === 'filename' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#b8b8b8' }}>
                File Name:
              </label>
              <input
                type="text"
                ref={inputRef}
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                placeholder={`untitled.${currentLanguage?.extension || 'txt'}`}
                style={{
                  ...styles.fileNameInput,
                  borderColor: validationError
                    ? '#EF4444'
                    : (styles.fileNameInput as any).borderColor,
                }}
                autoFocus
              />
              {validationError ? (
                <div role="alert" style={{ marginTop: '8px', fontSize: '12px', color: '#EF4444' }}>
                  {validationError}
                </div>
              ) : (
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#888888' }}>
                  Final name: <span style={{ color: '#00a6d7' }}>{finalNamePreview}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div>
            {step !== 'category' && (
              <button style={styles.button} onClick={handleBack}>
                ← Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={styles.button} onClick={onClose}>
              Cancel
            </button>
            {step === 'filename' && (
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onClick={handleCreate}
                disabled={!!validationError}
              >
                Create File
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );


  return createPortal(modalContent, document.body);
};

export default NewFileModal;
