export interface Interview {
    id: string;
    userId: string;
    status: string;
    createdAt: Date;
}
export interface Question {
    id: string;
    interviewId: string;
    question: string;
    answer?: string;
}
//# sourceMappingURL=interview.d.ts.map