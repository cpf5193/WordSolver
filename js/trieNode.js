// Constructor for a TrieNode with value 'value'
// this.value: the letters contained in this TrieNode, e.g. 'Qu'
// this.children: the children in the Trie for this TrieNode
// this.isWord: whether this node holds the last letter of a path containing a word
function TrieNode(value) {
  this.value = value;
  this.children = {};
  this.isWord = false;
};

// Inserts word 'word' into the trie starting at this TrieNode
// word: the word to insert into the trie
TrieNode.prototype.insert = function(word) {
  // Get the part of the word that should be put into this node
  var firstChar = word.charAt(0);
  var childNode = this.children[firstChar];

  // If this letter is the end of the word
  if (word.length === 1) {
    if (childNode !== undefined) {
      // This prefix already exists, just mark the node as a word
      childNode.isWord = true;
    } else {
      // new word, add it to the trie
      var newChild = new TrieNode(firstChar);
      newChild.isWord = true;
      this.children[firstChar] = newChild;
    }
  } else {
    if (childNode !== undefined) {
      // This part of the word exists, keep moving
      childNode.insert(word.substring(1, word.length));
    } else {
       // new word, add it
      var newChild = new TrieNode(firstChar);
      newChild.insert(word.substring(1, word.length));
      this.children[firstChar] = newChild;
    }
  }
};

// Returns true if prefix is in this subtree
// prefix: the prefix to look up in the trie
TrieNode.prototype.lookup = function(prefix) {
  if (prefix.length === 0) {
    return false;
  } else if (prefix.length === 1) {
    return (prefix in this.children);
  } else {
    var letter = prefix.charAt(0);
    if (letter in this.children) {
      var nextChild = this.children[letter];
      return nextChild.lookup(prefix.substring(1, prefix.length));
    }
  }
};

// Returns true if the given word is an existing complete word
// prefix: the prefix to check whether it is a complete word in the trie
TrieNode.prototype.isWordInTrie = function(prefix) {
  // This function is similar to lookup, but only returns true if the node's 
  // 'isWord' property is true
  if (prefix.length === 0) {
    return false;
  } else if (prefix.length === 1) {
    var letter = prefix.charAt(0);
    var nextChild = this.children[letter];
    return (letter in this.children) && nextChild.isWord;
  } else {
    var letter = prefix.charAt(0);
    if (letter in this.children) {
      var nextChild = this.children[letter];
      return nextChild.isWordInTrie(prefix.substring(1, prefix.length));
    }
  }
}