/** Records a problem in a source file; any problem fails the generation. */
export type Report = (file: string, message: string) => void;
