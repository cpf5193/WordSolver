// Constructor for a new Trie
function Trie() {
  this.root = new TrieNode('');
};

// Insert method for the trie
// Inserts word into the trie
Trie.prototype.insert = function(word) {
  this.root.insert(word);
};

// Lookup method for the trie
// Returns true if word is in the trie
Trie.prototype.lookup = function(word) {
  return this.root.lookup(word);
};