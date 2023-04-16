<script>
  import convertToHTML from 'markdown-to-html-converter';

  const content = `
  # We Are Sitting In A Pond

  In 1982, the Dutch physicist and sound artist, Felix Hess, presented the first of his [sound installations based on frogs](https://bldgblog.com/2008/04/space-as-a-symphony-of-turning-off-sounds/). In these installations, consisting of a set of over thirty robots, each robot-frog is outfitted with a microphone, speaker, and circuitry to allow it to listen to its environment and chirp together in the manner of a [frog chorus](https://www.nytimes.com/2022/04/28/science/frogs-mating-songs.html). 

  That same year, he published his first cassette tape of Australian frog field recordings, *[Frogs 1](https://www.discogs.com/release/2383064-Felix-Hess-Frogs-1)*, on the enigmatic [Taal Beeld Geluid](https://www.discogs.com/label/204315-Taal-Beeld-Geluid) tape label, better known for publishing recordings of kinetic guitar sculptures by the computational linguist [Remko Scha](https://blacktruffle.bandcamp.com/album/guitar-mural-1-feat-the-machines). Like Remko, Felix's interest seemed to lie in the emergent complexity of a dynamic system composed of simple agents. And while Remko's work on [Data-oriented Parsing](https://press.uchicago.edu/ucp/books/book/distributed/D/bo3619719.html) has been foundational to the development of large language models like GPT<sup>1</sup>, Felix's work, too, has engaged questions of how a machine can be like a living creature.

  > The acoustic communications between animals like frogs, cicadas, or grasshoppers often give rise to group concerts or choruses. Both order and chaos appear to be present in the resulting sound patterns, and one may notice various rhythms and wavelike movements. Similar group processes can be realised with machines built specifically for such a purpose. - Felix Hess, *[Electronic Sound Creatures](https://alife.org/wp-content/uploads/2013/08/collections_ECAL93-0452-0457-Hess.pdf)*

  I first encountered Felix Hess's frogs some ten years ago while researching artists along the outer edges of post-war European sound art. With his background and career in physics, his work posseses a sensibility similar to that of the late American composer, [Alvin Lucier](https://www.documenta14.de/en/artists/5877/alvin-lucier), whose major body of work was engaged in rendering the physics of sound as simply as possible. However, Felix's attention to embodied perception, and the qualities of attention itself, aligns him more closely with Pauline Oliveros, whose practice and advocacy of Deep Listening<sup>2</sup> is predominantly occupied with questions of embodied perception.

  > Her holistic approach to making music is a testament to the generative powers of listening, noticing, improvisation and responding to what is already here rather than seeking to overwrite it - Claire-Louise Bennett, author of *[Pond](https://fitzcarraldoeditions.com/books/pond)* in her [writing on Pauline Oliveros](https://www.nytimes.com/2017/02/09/magazine/letter-of-recommendation-the-recordings-of-pauline-oliveros.html)

  In the early months of 2023, as I've been navigating my own questions of time and attention after having left my job of seven years at *[New York Magazine](https://nymag.com)*, I've built this project as an homage to Felix, [who passed away in 2022](https://www.aviationanalysis.net/physicist-and-installation-artist-felix-hess-81-has-died/). But I also wish to leave an impression of an implicit critique: in an age where machines are unquestionably embued with a sense of aliveness, what of our own aliveness is inexectricably subjected to the logic of machines? And is it attention, itself, that may be both the casualty and the potential rebuttal against the erosion of alterity at the human-machine interface?
  
  The philosopher Simone Weil wrote, "Attention is a “negative effort,” a process that involves observation, sliding the self a little out of the way, so that the thing might present itself in full", suggesting a throughline from the attentive listening practices of Pauline Oliveros, which suggests a direct relationship between apprehension of the world and the ego within. The psychiatrist and neuroscience researcher Iain McGilchrist, complicates the question of attention futher, suggesting that "[...] the nature of attention alters what it finds; and specifically that when we cease to act, to be involved, spontaneous, and intuitive, and instead become passive, disengaged, self-conscious, and stare in an 'objective' fashion at the world around us, it becomes bizarre, alien, frightening — and curiously similar to the mental world of the schizophrenic".

  The hope, here, is to offer an exercise in exploring these questions of what humans are left to do while machines do all the talking (or chirping). If [dark forests on the web](https://onezero.medium.com/the-dark-forest-theory-of-the-internet-7dc3e68a7cb1) continue to evolve in offering spaces to engage without the context collapse of centralized platforms, while also opting out of the ingestion pipelines of large language models, consider this project as creating a pond inside of a dark forest. A pond as an ephemeral social architecture, a site for gathering and collective sense-making, which depending on environmental conditions, may only sometimes defy the [tendency to dry up or succumb to blooms of toxic algae](https://www.nytimes.com/2023/03/27/opinion/frogs-vernal-pools-ecosystem-climate.html).

  To bring things back to the frogs, Felix says it best himself: 
  
  > "The complexity of my electronic 'sound creatures' is nothing compared to that of any biological system [...] I developed them as a means to investigate the nature of listening. Through actually building machines such as the 'sound creatures' one can get a 'feel' for the relationship between sensitivity and intelligence. This work has only increased my respect for the frogs, who taught me to sit in silence and listen."
  
  <br />
  ----

  [1] When asking ChatGPT (04/15/2023), "Remko Scha's work has been foundational in the development of large language models like GPT by providing key insights and concepts related to linguistic knowledge representation, computational semiotics, cognitive modeling, and language generation, which have influenced the architecture, design, and training methodologies of these models." From a conversation with ChatGPT on April 15, 2023, in which I asked, "How foundational is the work of Remko Scha in the development of large language models like GPT?"

  [2] "In Deep Listening we talk about two forms: focal attention and global attention. Focus [focal] is more like digital, in that focused attention needs to be renewed moment by moment, in order to exclusively follow a stream of some sort. A stream of speech for example; you have to keep renewing your attention to what is being said. All of us have the experience of being distracted for a minute and missing part of what someone has said. So, to keep your attention focused takes quite a bit of energy. Global attention is expanding to take in and listen to everything that is around you; inside of you. When we do this, and we can expand almost infinitely to include, and this is what I call inclusive listening, everything that is possible to listen to. Most of the time we are discarding what’s going on as not important, but in order to do what I call Deep Listening we have to include everything." From an [interview with Pauline Oliveros on Sound American](http://archive.soundamerican.org/sa_archive/sa7/sa7-pauline-oliveros-on-deep-listening.html)
  `;
  let html = convertToHTML(content);

  html = html.replaceAll('<br/>', '');
  </script>

<section>
  {@html html}
</section>

<style>
 /* because of how markdown content is being embedded here,
 styles are writtein to app.css instead */
</style>