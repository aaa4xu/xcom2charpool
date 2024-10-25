/** Обертка над данными с поддержской чтения нужного набора типов данных и внутренним счетчиком позиции */
export interface Reader {
  readonly length: number;
  readonly position: number;

  rewind(offset: number): void;

  uint32(): number;

  int32(): number;

  /**
   * UE сериализует строки в utf8?/utf16 в зависимости от используемых символов
   * @see https://dev.epicgames.com/documentation/en-us/unreal-engine/character-encoding#ue4internalstringrepresentation
   */
  string(): string;

  byte(): number;

  subarray(length: number): Reader;

  // Все еще не уверен, что это padding на самом деле
  padding(): void;
}
