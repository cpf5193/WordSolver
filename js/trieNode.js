// Constructor for a TrieNode with value 'value'
function TrieNode(value) {
  this.value = value;
  this.children = {};
  this.isWord = false;
};

// Insert function for TrieNode
// Inserts word into this subtree
TrieNode.prototype.insert = function(word) {
  var firstChar = word.charAt(0);
  var childNode = this.children[firstChar];
  if (word.length === 1) {
    if (childNode !== undefined) {
      // The word already exists, mark it as a word
      childNode.isWord = true;
    } else {
      // new word, add it
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

// Lookup method for TrieNode
// Returns true if word is in this subtree
TrieNode.prototype.lookup = function(prefix) {
  if (prefix.length === 0) {
    return false;
  } else if (prefix.length === 1) {
    return (prefix.charAt(0) in this.children);
  } else {
    var letter = prefix.charAt(0);
    if (letter in this.children) {
      var nextChild = this.children[letter];
      return nextChild.lookup(prefix.substring(1, prefix.length));
    }
  }
};


// TrieNode.prototype.lookup = function(word) {
//   if (word.length === 0 || (this.value !== word.charAt(0))) {
//     // this prefix is not in the tree
//     return false;
//   } else {
//     // The first character of 'word' must match this node's value
//     if (word.length === 1) {
//       return true;
//     } else {
//       return this.lookup(word.substring(1, word.length));
//     }
//   }
// };

// isWord method for TrieNode
// Returns true if the given word is an existing complete word
TrieNode.prototype.isWordInTrie = function(prefix) {
  //Make this method similar to lookup, but only return true if the node's 'isWord' is true
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