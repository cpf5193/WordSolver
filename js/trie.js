// Constructor for a new Trie
function Trie() {
  this.root = new TrieNode('');
};

// Inserts word into the trie
Trie.prototype.insert = function(word) {
  this.root.insert(word);
};

// Returns true if word is in the trie
Trie.prototype.lookup = function(word) {
  return this.root.lookup(word);
};

// Determine whether the given word is a valid word in the trie
Trie.prototype.isWordInTrie = function(word) {
  return this.root.isWordInTrie(word);
}