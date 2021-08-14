const { breakDownString } = require("./../../../core/actions/shitpost");

const sentenceSeparator = null;

test('when null string is passed in, returns empty list', () => {
    // Arrange
    const input = null;
    const expected = [];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when undefined string is passed in, returns empty list', () => {
    // Arrange
    const input = undefined;
    const expected = [];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when empty string is passed in, returns empty list', () => {
    // Arrange
    const input = "";
    const expected = [];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when one word sentence is passed in, returns list of one word', () => {
    // Arrange
    const input = "Test";
    const expected = ["Test"];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when multi word sentence is passed in, returns list of words', () => {
    // Arrange
    const input = "A longer test";
    const expected = ["A", "longer", "test"];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when multiple sentences are passed in, returns list with separators present', () => {
    // Arrange
    const input = "Sentence one. Sentence two. Sentence three.";
    const expected = ["Sentence", "one", sentenceSeparator, "Sentence", "two", sentenceSeparator, "Sentence", "three", sentenceSeparator];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when multiple sentences with varying punctuation are passed in, returns list with separators present', () => {
    // Arrange
    const input = "Sentence one? Sentence two! Sentence three.";
    const expected = ["Sentence", "one", sentenceSeparator, "Sentence", "two", sentenceSeparator, "Sentence", "three", sentenceSeparator];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when string with link is passed in, returns list with link removed', () => {
    // Arrange
    const input = "Check this out https://www.google.com so cool";
    const expected = ["Check", "this", "out", "so", "cool"];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when string with punctuation is passed in, returns list with disallowed punctuation removed', () => {
    // Arrange
    const input = "I'm semi-sure that I'm about a 1/3rd okay";
    const expected = ["I'm", "semi-sure", "that", "I'm", "about", "a", "1", "3rd", "okay"];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when string with punctuation is passed in, returns list with disallowed punctuation removed', () => {
    // Arrange
    const input = "Based on this: U_ARE_DEAD. Do you understand 2+2?";
    const expected = ["Based", "on", "this", "U_ARE_DEAD", sentenceSeparator, "Do", "you", "understand", "2", "2", sentenceSeparator];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

// test('when string with normal emoji is passed in, returns list with normal emoji still preserved', () => {
//     // Arrange
//     const input = "Feeling 👀 right now";
//     const expected = ["Feeling", "👀", "right", "now"];

//     // Act
//     const result = breakDownString(input);

//     // Assert
//     expect(result).toEqual(expected);
// });

test('when string with Discord emoji is passed in, returns list with Discord emoji still preserved', () => {
    // Arrange
    const input = "That is very <:mrblobby:830566043470528564>, dude";
    const expected = ["That", "is", "very", "<:mrblobby:830566043470528564>", "dude"];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when string with Discord user tag is passed in, returns list with Discord user tag still preserved', () => {
    // Arrange
    const input = "Hey, <@!210522625556873216> you there?";
    const expected = ["Hey", "<@!210522625556873216>", "you", "there", null];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});

test('when string with Discord channel tag is passed in, returns list with Discord channel tag removed', () => {
    // Arrange
    const input = "Please do not post memes in <#833121468618768396>";
    const expected = ["Please", "do", "not", "post", "memes", "in"];

    // Act
    const result = breakDownString(input);

    // Assert
    expect(result).toEqual(expected);
});