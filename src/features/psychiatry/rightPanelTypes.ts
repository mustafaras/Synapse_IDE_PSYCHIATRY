


export type RPKey = {
	sectionId: string;
	leafId: string;
	subleafId: string;
	itemId?: string;
};

export type RPInfoCard = {
	title: string;
	body: string[];
};


export type RPExample = {
	id: string;
	label: string;
	html?: string;
	question?: string;
};

export type RPPrompt = { text: string };
export type RPReference = { title: string };


export type RPBundle = {
	infoCards: RPInfoCard[];
	exampleHtml: string;
	prompts: string[];
	references: string[];
};


export type NormalizedBlock = {
	info: string;
	examples: Array<{ id: string; label: string; html: string; question?: string }>;
	defaultExampleId: string | null;
	references: string[];
	commands: Array<{ text: string }>;
};

