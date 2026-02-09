declare module 'bcrypt' {
  function hash(data: string, saltOrRounds: string | number): Promise<string>;
  function compare(data: string, encrypted: string): Promise<boolean>;
  function genSalt(rounds?: number): Promise<string>;

  const bcrypt: {
    hash: typeof hash;
    compare: typeof compare;
    genSalt: typeof genSalt;
  };

  export { hash, compare, genSalt };
  export default bcrypt;
}
