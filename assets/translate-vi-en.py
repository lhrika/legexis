from transformers import MarianMTModel, MarianTokenizer
import sys, re

def split_vietnamese_text_into_sentences(text):
    """
    Splits Vietnamese text into sentences using appropriate criteria.
    """
    # Regular expression to match sentence-ending punctuation
    sentence_endings = r'(?<!\w\.\w.)(?<![A-ZĐÂÊÔƯĂƠÍÁÉÚÓÝ])(?<!\s\w\.\w\.)(?<!\d\.\d)([.!?])\s'
    
    # Split the text using the regex
    sentences = re.split(sentence_endings, text)
    
    # Combine the punctuation back with the sentences
    result = []
    for i in range(0, len(sentences) - 1, 2):
        sentence = sentences[i].strip() + sentences[i + 1].strip()
        result.append(sentence)
    
    # Add the last part if it exists
    if len(sentences) % 2 != 0:
        result.append(sentences[-1].strip())
    
    return result


# Load the model and tokenizer for English to Vietnamese
# model_name = "Helsinki-NLP/opus-mt-en-vi"
# tokenizer = MarianTokenizer.from_pretrained(model_name)
# model = MarianMTModel.from_pretrained(model_name)

# Load the model and tokenizer for Vietnamese to English
model_name = "Helsinki-NLP/opus-mt-vi-en"
tokenizer = MarianTokenizer.from_pretrained(model_name)
model = MarianMTModel.from_pretrained(model_name)

# Input text to translate
text_to_translate = split_vietnamese_text_into_sentences(sys.argv[1])

# Tokenize the input text
inputs = tokenizer(text_to_translate, return_tensors="pt", padding=True, truncation=True)

# Generate translation
translated = model.generate(**inputs)

# Decode the translated text
translated_text = ' '.join(tokenizer.decode(t, skip_special_tokens=True) for t in translated)

# Print the results
print(translated_text)
