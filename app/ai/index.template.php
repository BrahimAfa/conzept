<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="description" content="Transformers.js" />
    <meta name="author" content="Xenova" />
    <title>Transformers.js</title>

    <!-- conzept resources -->
    CONZEPT_COMMON_HTML_INCLUDE

    <style>
      #summarization-output-textbox {
        border: 3px solid black;
      }
    </style>

    <!-- Favicon-->
    <!-- Icon made by Freepik (https://www.flaticon.com/free-icons/robot) -->
    <link rel="icon" type="image/x-icon" href="./assets/icons/favicon.ico" />

    <!-- Bootstrap icons-->
    <link href="./assets/css/bootstrap-icons.css" rel="stylesheet" />

    <!-- Core theme CSS (includes Bootstrap)-->
    <link href="./assets/css/theme.css" rel="stylesheet" />

    <!-- Code highlighting -->
    <link href="./assets/css/prism.css" rel="stylesheet" />

    <!-- Custom styles for page -->
    <link href="./assets/css/style.css" rel="stylesheet" />
    <link href="./assets/css/conzept.css" rel="stylesheet" />


    <!-- Bootstrap core JS-->
    <script src="./assets/js/bootstrap.bundle.min.js" defer></script>

    <!-- Code highlighting JS -->
    <script src="./assets/js/prism.js" defer></script>

    <!-- Chart JS -->
    <script src="./assets/js/chart.js"></script>

    <!-- Page JS-->
    <script src="./assets/js/scripts.js" defer></script>

    <script src="./assets/js/conzept.js" defer></script>

</head>

<body>
    <!-- Responsive navbar-->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container px-5">
            <a class="navbar-brand" href="#">Transformers.js</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="#demo">Demo</a></li>
                    <li class="nav-item"><a class="nav-link" href="#getting-started">Getting Started</a></li>
                    <li class="nav-item"><a class="nav-link" href="#usage">Usage</a></li>
                    <li class="nav-item"><a class="nav-link" href="#examples">Examples</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Modal -->
    <div class="modal fade" id="content-modal" tabindex="-1" aria-labelledby="modal-label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal-label">Viewing content</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body"></div>
            </div>
        </div>
    </div>

    <!-- Header-->
    <header class="bg-dark pt-3 pb-5">
        <div class="container px-5">
            <div class="row gx-5 justify-content-center">
                <div class="col-lg-6">
                    <div class="text-center">
                        <h1 class="display-5 fw-bolder text-white mb-2">Transformers.js</h1>
                        <p class="lead text-white-50 mb-4">
                            Run <span class="text-white">🤗</span> Transformers in your browser!
                        </p>
                        <div class="d-grid gap-3 d-sm-flex justify-content-sm-center">
                            <a class="btn btn-primary btn-lg px-4 me-sm-3" href="#getting-started">Get Started</a>
                            <a class="btn btn-outline-light btn-lg px-4"
                                href="https://github.com/xenova/transformers.js">
                                <i class="bi bi-github"></i> View Source
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Demo section-->
    <section class="py-4 border-bottom" id="demo">
        <div class="container px-5 my-4">
            <div class="mb-2" style="display:none;">
                <h2 class="fw-bolder">Demo</h2>
                <p class="lead mb-0">Don't believe us? Play around with some of these models:</p>
            </div>
            <div class="row justify-content-center">
                <label>Task: </label>
                <div class="col-12 mt-1">
                    <select id="task" class="form-select">
                        <option value="translation" selected>
                            Translation w/ t5-small (95 MB)
                        </option>
                        <option value="text-generation">
                            Text generation w/ distilgpt2 (250 MB)
                        </option>
                        <option value="masked-language-modelling">
                            Masked language modelling w/ bert-base-cased (132 MB)
                        </option>
                        <option value="sequence-classification">
                            Text classification w/ bert-base-multilingual-uncased-sentiment (170 MB)
                        </option>
                        <option value="question-answering">
                            Question answering w/ distilbert-base-uncased-distilled-squad (66 MB)
                        </option>
                        <option value="summarization">
                            Summarization w/ distilbart-cnn-6-6 (336 MB)
                        </option>
                        <option value="code-completion">
                            Code completion w/ Salesforce/codegen-350M-mono (365 MB)
                        </option>
                        <option value="automatic-speech-recognition">
                            Speech to text w/ whisper-tiny.en (61 MB)
                        </option>
                        <option value="image-to-text">
                            Image to text w/ vit-gpt2-image-captioning (622 MB)
                        </option>
                        <option value="image-classification">
                            Image classification w/ google/vit-base-patch16-224 (91 MB)
                        </option>
                        <option value="zero-shot-image-classification">
                            Zero-shot image classification w/ openai/clip-vit-base-patch16 (152 MB)
                        </option>
                        <option value="object-detection">
                            Object detection w/ facebook/detr-resnet-50 (43 MB)
                        </option>
                    </select>
                </div>

                <div id="languages" task="translation" class="task-settings">
                    <label class="mt-2">Languages: </label>
                    <div class="d-flex">
                        <div style="width: calc(50% - 20px);">
                            <select id="language-from" class="form-select mt-1 col-3">
                                <option value="en" selected>English</option>
                            </select>
                        </div>
                        <div style="width: 40px;" class="d-flex justify-content-center align-items-center">to</div>
                        <div style="width: calc(50% - 20px);">
                            <select id="language-to" class="form-select mt-1 col-3">
                                <option value="fr" selected>French</option>
                                <option value="de">German</option>
                                <option value="ro">Romanian</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="task-settings"
                    task="translation,text-generation,code-completion,masked-language-modelling,summarization,automatic-speech-recognition,image-to-text">
                    <label class="mt-2">Parameters: </label>
                    <div class="row">
                        <div class="task-settings col-xl-2 col-md-4 col-sm-6"
                            task="translation,text-generation,code-completion,summarization,automatic-speech-recognition,image-to-text">
                            <div class="input-group mb-2">
                                <span class="input-group-text">Max length</span>
                                <input type="number" param-name="max_new_tokens" datatype="number" min="1"
                                    class="form-control generation-option" value="200">
                            </div>
                        </div>
                        <div class="task-settings col-xl-2 col-md-4 col-sm-6"
                            task="translation,text-generation,code-completion,summarization,automatic-speech-recognition,image-to-text">
                            <div class="input-group mb-2" title="Number of beams">
                                <span class="input-group-text">No. beams</span>
                                <input type="number" param-name="num_beams" datatype="number" min="1" max="50"
                                    class="form-control generation-option" value="1">
                            </div>
                        </div>
                        <div class="task-settings col-xl-2 col-md-4 col-sm-6" task="masked-language-modelling">
                            <div class="input-group mb-2" title="Number of samples">
                                <span class="input-group-text">No. samples</span>
                                <input type="number" param-name="topk" datatype="number" min="1" max="50"
                                    class="form-control generation-option" value="5">
                            </div>
                        </div>
                        <div class="task-settings col-xl-2 col-md-4 col-sm-6"
                            task="translation,text-generation,code-completion,summarization,automatic-speech-recognition,image-to-text">
                            <div class="input-group mb-2" title="Temperature (> 0)">
                                <span class="input-group-text">Temp.</span>
                                <input type="number" param-name="temperature" datatype="number" min="0.001" step="1"
                                    class="form-control generation-option" value="1">
                            </div>
                        </div>
                        <div class="task-settings col-xl-2 col-md-4 col-sm-6"
                            task="translation,text-generation,code-completion,summarization,automatic-speech-recognition,image-to-text">
                            <div class="input-group mb-2">
                                <span class="input-group-text">Top K</span>
                                <input type="number" param-name="top_k" datatype="number" min="0"
                                    class="form-control generation-option" value="0">
                            </div>
                        </div>
                        <div class="task-settings col-xl-2 col-md-4 col-sm-6"
                            task="translation,text-generation,code-completion,summarization,automatic-speech-recognition,image-to-text">
                            <div class="input-group mb-2" title="Perform multinomial sampling">
                                <label class="input-group-text" for="sample-select">Sample</label>
                                <select param-name="do_sample" datatype="bool" class="form-select generation-option"
                                    id="sample-select">
                                    <option value="true">Yes</option>
                                    <option value="false" selected>No</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div task="sequence-classification" class="task-settings">
                    <div class="row">
                        <div class="col-lg-6">
                            <textarea id="tc-input-textbox" class="mt-3 form-control"
                                rows="5">The Shawshank Redemption is a true masterpiece of cinema, a movie that deserves every bit of its status as one of the greatest films ever made. From its stellar performances to its unforgettable storytelling, everything about this film is a testament to the power of great filmmaking.</textarea>
                        </div>
                        <div class="col-lg-6 mt-1" style="max-height:146px">
                            <canvas id="tc-canvas"></canvas>
                        </div>
                    </div>
                </div>
                <div task="masked-language-modelling" class="task-settings">
                    <div class="row">
                        <div class="col-lg-6">
                            <textarea id="mlm-input-textbox" class="mt-3 form-control"
                                rows="5">The goal of life is [MASK].</textarea>
                        </div>
                        <div class="col-lg-6">
                            <textarea id="mlm-output-textbox" class="mt-3 form-control" rows="5"></textarea>
                        </div>
                    </div>
                </div>
                <div task="question-answering" class="task-settings">
                    <div class="row">
                        <div class="col-lg-12">
                            <p class="mt-3 mb-0">Context:</p>
                            <textarea id="qa-context-textbox" class="form-control"
                                rows="7">The Amazon rainforest (Portuguese: Floresta Amazônica or Amazônia; Spanish: Selva Amazónica, Amazonía or usually Amazonia; French: Forêt amazonienne; Dutch: Amazoneregenwoud), also known in English as Amazonia or the Amazon Jungle, is a moist broadleaf forest that covers most of the Amazon basin of South America. This basin encompasses 7,000,000 square kilometres (2,700,000 sq mi), of which 5,500,000 square kilometres (2,100,000 sq mi) are covered by the rainforest. This region includes territory belonging to nine nations. The majority of the forest is contained within Brazil, with 60% of the rainforest, followed by Peru with 13%, Colombia with 10%, and with minor amounts in Venezuela, Ecuador, Bolivia, Guyana, Suriname and French Guiana. States or departments in four nations contain "Amazonas" in their names. The Amazon represents over half of the planet's remaining rainforests, and comprises the largest and most biodiverse tract of tropical rainforest in the world, with an estimated 390 billion individual trees divided into 16,000 species.</textarea>
                        </div>
                        <div class="col-lg-6">
                            <p class="mt-3 mb-0">Question:</p>
                            <textarea id="qa-question-textbox" class="form-control"
                                rows="5">What proportion of the planet's rainforests are found in the Amazon?</textarea>
                        </div>
                        <div class="col-lg-6">
                            <p class="mt-3 mb-0">Answer:</p>
                            <textarea id="qa-answer-textbox" class="form-control" rows="5"></textarea>
                        </div>
                    </div>
                </div>
                <div task="translation" class="task-settings">
                    <div class="row">
                        <div class="col-lg-6">
                            <textarea id="input-textbox" class="mt-3 form-control"
                                rows="5">Hello, how are you?</textarea>
                        </div>
                        <div class="col-lg-6">
                            <textarea id="output-textbox" class="mt-3 form-control" rows="5"></textarea>
                        </div>
                    </div>
                </div>
                <div task="summarization" class="task-settings">
                    <div class="row">
                        <div class="col-lg-9">
                            <textarea id="summarization-input-textbox" class="mt-3 form-control"
                                rows="6">The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct.</textarea>
                        </div>
                        <div class="col-lg-3">
                            <textarea id="summarization-output-textbox" class="mt-3 form-control" rows="6"></textarea>
                        </div>
                    </div>
                </div>
                <div task="text-generation" class="task-settings">
                    <div class="row">
                        <div class="col-lg-12 mt-3">
                            <textarea id="text-generation-textbox" class="form-control"
                                rows="10">I enjoy walking with my cute dog,</textarea>
                        </div>
                    </div>
                </div>
                <div task="code-completion" class="task-settings">
                    <div class="row">

                        <div class="col-lg-12 mt-3">
                            <div id="code-completion-container" class="code-container">
                                <textarea spellcheck="false">def fib(n):</textarea>
                                <pre aria-hidden="true">
                                    <code class="language-python" id="highlighting-content">def fib(n):</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
                <div task="automatic-speech-recognition" class="task-settings">

                    <div class="row">

                        <label class="mt-3">Audio: </label>

                        <div class="col-lg-6">
                            <select id="audio-select" class="form-select">
                                <option value="./assets/audio/jfk.wav">Example 1</option>
                                <option value="./assets/audio/ted.wav">Example 2</option>
                                <option value="./assets/audio/ted_60.wav">Example 3</option>
                                <option show-custom>Custom</option>
                            </select>

                            <input class="mt-2 form-control" style="display: none;" type="file" id="audio-file"
                                name="audio-file" accept="audio/*">

                            <audio id="audio-player" controls class="mt-2 w-100">
                                <source src="./assets/audio/jfk.wav">
                                Your browser does not support the audio element.
                            </audio>
                        </div>

                        <div class="col-lg-6">
                            <textarea id="speech2text-output-textbox" class="form-control" rows="6"></textarea>
                        </div>
                    </div>
                </div>
                <div task="image-to-text" class="task-settings">

                    <div class="row pt-2">
                        <div class="col-lg-6">
                            <label>Image: </label>
                            <select id="image-select" class="form-select">
                                <option value="./assets/images/football-match.jpg">
                                    Example 1
                                </option>
                                <option value="./assets/images/airport.jpg">
                                    Example 2
                                </option>
                                <option value="./assets/images/savanna.jpg">
                                    Example 3
                                </option>
                                <option show-custom>Custom</option>
                            </select>

                            <input class="mt-2 form-control" style="display: none;" type="file" id="image-file"
                                name="image-file" accept="image/*">

                            <img id="image-viewer" class="w-100 p-4" src="./assets/images/football-match.jpg"
                                crossorigin="anonymous">
                        </div>

                        <div class="col-lg-6">
                            <textarea id="image2text-output-textbox" class="form-control" rows="6"></textarea>
                        </div>
                    </div>
                </div>
                <div task="image-classification" class="task-settings">

                    <div class="row pt-2">
                        <div class="col-lg-6">
                            <label>Image: </label>
                            <select id="ic-select" class="form-select">
                                <option value="./assets/images/tiger.jpg">
                                    Example 1
                                </option>
                                <option value="./assets/images/teapot.jpg">
                                    Example 2
                                </option>
                                <option value="./assets/images/palace.jpg">
                                    Example 3
                                </option>
                                <option show-custom>Custom</option>
                            </select>

                            <input class="mt-2 form-control" style="display: none;" type="file" id="ic-file"
                                name="ic-file" accept="image/*">

                            <img id="ic-viewer" class="w-100 p-4" src="./assets/images/tiger.jpg"
                                crossorigin="anonymous">
                        </div>

                        <div class="col-lg-6" style="max-height:146px">
                            <canvas id="ic-canvas"></canvas>
                        </div>
                    </div>
                </div>
                <div task="zero-shot-image-classification" class="task-settings">

                    <div class="row pt-2">


                        <div class="col-lg-6">
                            <label>Image: </label>

                            <select id="zsic-select" class="form-select">
                                <option value="./assets/images/football-match.jpg">
                                    Example 1
                                </option>
                                <option value="./assets/images/airport.jpg">
                                    Example 2
                                </option>
                                <option value="./assets/images/savanna.jpg">
                                    Example 3
                                </option>
                                <option show-custom>Custom</option>
                            </select>

                            <input class="mt-2 form-control" style="display: none;" type="file" id="zsic-file"
                                name="zsic-file" accept="image/*">

                            <img id="zsic-viewer" class="w-100 p-4" src="./assets/images/football-match.jpg"
                                crossorigin="anonymous">

                        </div>

                        <div class="col-lg-6 mt-1">
                            <label for="zsic-classes" class="form-label mb-0">Possible class names
                                (comma-separated):</label>
                            <input type="text" class="form-control" id="zsic-classes"
                                value="football, airport, animals">
                            <div style="max-height:146px">
                                <canvas id="zsic-canvas"></canvas>
                            </div>

                        </div>

                    </div>
                </div>
                <div task="object-detection" class="task-settings">
                    <div class="row pt-2">
                        <div class="col-lg-6">
                            <label>Image: </label>
                            <select id="od-select" class="form-select">
                                <option value="./assets/images/cats.jpg">
                                    Example 1
                                </option>
                                <option value="./assets/images/football-match.jpg">
                                    Example 2
                                </option>
                                <option value="./assets/images/airport.jpg">
                                    Example 3
                                </option>
                                <option value="./assets/images/savanna.jpg">
                                    Example 4
                                </option>
                                <option show-custom>Custom</option>
                            </select>

                            <input class="mt-2 form-control" style="display: none;" type="file" id="od-file"
                                name="od-file" accept="image/*">

                            <div class="position-relative">
                                <img id="od-viewer" class="w-100 h-100 p-4" src="./assets/images/cats.jpg"
                                    crossorigin="anonymous">
                                <svg id="od-overlay" preserveAspectRatio="none"
                                    class="position-absolute w-100 h-100 left-0 start-0 p-4" style="z-index: 1;"
                                    viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
                                </svg>
                            </div>

                        </div>

                        <div class="col-lg-6 mt-lg-5" style="max-height:250px">
                            <canvas id="od-canvas" style="height:250px"></canvas>
                        </div>
                    </div>
                </div>
                <div class="mt-3 mb-1">
                    Notes:
                    <ul>
                        <li>Clicking <em>Generate</em> for the first time will download the corresponding model from the
                            <a href="https://huggingface.co/models">HuggingFace Hub</a>.
                            All subsequent requests will use the cached model.
                        </li>
                        <li>For more information about the different parameters, check out HuggingFace's
                            <a href="https://huggingface.co/blog/how-to-generate">guide to text generation</a>.
                        </li>
                    </ul>
                </div>
                <div class="col-12 mt-2 d-flex justify-content-center">
                    <button id="generate" type="button" class="btn btn-primary">Generate</button>

                    <!-- <button class="btn btn-primary" type="button">
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span class="visually-hidden">Loading...</span>
                      </button> -->
                </div>

                <div id="progress" class="col-12 mt-4" style="display: none;">
                    <div class="d-flex align-items-center position-relative py-2">
                        <div><strong>Loading model files...</strong> (only run once)</div>
                        <div class="spinner-border position-absolute" role="status" aria-hidden="true" style="right: 0">
                        </div>
                    </div>

                    <div id="progress-bars" class="d-flex justify-content-center flex-column gap-2 py-2"></div>
                </div>
            </div>
        </div>
    </section>


    <!-- Teaser section-->
    <section class="py-4 border-bottom" id="getting-started">
        <div class="container px-5 my-4">
            <div class="mb-3">
                <h2 class="fw-bolder">Getting Started</h2>
            </div>
            <div class="mb-3">
                <h5 class="mb-2">Installation</h5>
                If you use <a href="https://www.npmjs.com/package/@xenova/transformers">npm</a>,
                you can install it using:
                <pre><code class="language-bash">npm i @xenova/transformers</code></pre>

                Alternatively, you can use it in a
                <code>&lt;script&gt;</code>
                tag from a CDN, for example:
                <pre><code class="language-html">&lt;!-- Using jsDelivr --&gt;
&lt;script src=&quot;https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js&quot;&gt;&lt;/script&gt;

&lt;!-- or UNPKG --&gt;
&lt;script src=&quot;https://www.unpkg.com/@xenova/transformers/dist/transformers.min.js&quot;&gt;&lt;/script&gt;</code></pre>
            </div>

            <div class="mb-3">
                <h5 class="mb-2">Basic example</h5>
                It's super easy to translate from existing code!
                <div class="row gx-5">
                    <div class="col-lg-6 mb-4 mb-lg-0">
                        <pre><code class="language-python">from transformers import pipeline

# Allocate a pipeline for sentiment-analysis
pipe = pipeline('sentiment-analysis')

out = pipe('I love transformers!')
# [{'label': 'POSITIVE', 'score': 0.999806941}]</code></pre>
                        <p class="mb-0 text-center">Python (original)</p>

                    </div>
                    <div class="col-lg-6 mb-4 mb-lg-0">
                        <pre><code class="language-js">import { pipeline } from "@xenova/transformers";

// Allocate a pipeline for sentiment-analysis
let pipe = await pipeline('sentiment-analysis');

let out = await pipe('I love transformers!');
// [{'label': 'POSITIVE', 'score': 0.999817686}]</code></pre>
                        <p class="mb-0 text-center">JavaScript (ours)</p>
                    </div>
                </div>
                <br>
                In the same way as the Python library, you can use a different model by providing its
                name as the second argument to the pipeline function. For example:
                <pre><code class="language-js">// Use a different model for sentiment-analysis
let pipe = await pipeline('sentiment-analysis', 'nlptown/bert-base-multilingual-uncased-sentiment');</code></pre>
            </div>

            <div class="mb-3">
                <h5 class="mb-2">Custom setup</h5>
                By default, Transformers.js uses hosted <a
                    href="https://huggingface.co/Xenova/transformers.js/tree/main/quantized">models</a>
                precompiled
                <a href="https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/">WASM binaries</a>,
                which should work out-of-the-box. You can override this behaviour as follows:
                <pre><code class="language-js">import { env } from "@xenova/transformers";

// Use a different host for models.
// - `remoteURL` defaults to use the HuggingFace Hub
// - `localURL` defaults to '/models/onnx/quantized/'
env.remoteURL = 'https://www.example.com/';
env.localURL = '/path/to/models/';

// Set whether to use remote or local models. Defaults to true.
//  - If true, use the path specified by `env.remoteURL`.
//  - If false, use the path specified by `env.localURL`.
env.remoteModels = false;

// Set parent path of .wasm files. Defaults to use a CDN.
env.onnx.wasm.wasmPaths = '/path/to/files/';</code></pre>
            </div>

        </div>
    </section>

    <!-- Usage section-->
    <section class="py-4 border-bottom" id="usage">
        <div class="container px-5 my-4">
            <div class="mb-3">
                <h2 class="fw-bolder">Usage</h2>
                <p class="lead mb-2">We currently support the following
                    <a href="https://huggingface.co/docs/hub/models-tasks">tasks</a> and
                    <a href="https://huggingface.co/models">models</a>, which can be used with the
                    <a href="https://huggingface.co/docs/transformers/main_classes/pipelines">pipeline</a>
                    function.
                </p>
                <ol class="list-group list-group-numbered">
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">sentiment-analysis (a.k.a. text-classification)</div>
                            Supported models: <code>distilbert-base-uncased-finetuned-sst-2-english</code>,
                            <code>nlptown/bert-base-multilingual-uncased-sentiment</code>,
                            <code>distilgpt2</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/tasks/sequence_classification">
                                Text Classification docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">question-answering</div>
                            Supported models: <code>distilbert-base-cased-distilled-squad</code>,
                            <code>distilbert-base-uncased-distilled-squad</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/tasks/question_answering">
                                Question Answering docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">fill-mask</div>
                            Supported models: <code>xlm-roberta-base</code>, <code>albert-large-v2</code>,
                            <code>albert-base-v2</code>, <code>distilroberta-base</code>, <code>roberta-base</code>,
                            <code>bert-base-cased</code>, <code>bert-base-uncased</code>,
                            <code>bert-base-multilingual-uncased</code>, <code>bert-base-multilingual-cased</code>,
                            <code>distilbert-base-cased</code>, <code>distilbert-base-uncased</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/tasks/language_modeling">
                                Language Modelling docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">summarization</div>
                            Supported models:
                            <code>t5-small</code>,
                            <code>t5-base</code>,
                            <code>t5-v1_1-small</code>,
                            <code>t5-v1_1-base</code>,
                            <code>facebook/bart-large-cnn</code>,
                            <code>sshleifer/distilbart-cnn-6-6</code>,
                            <code>sshleifer/distilbart-cnn-12-6</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/tasks/summarization">
                                Summarization docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">translation (translation_en_to_de, translation_en_to_fr,
                                translation_en_to_ro)</div>
                            Supported models:
                            <code>t5-small</code>,
                            <code>t5-base</code>,
                            <code>t5-v1_1-small</code>,
                            <code>t5-v1_1-base</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/tasks/translation">
                                Translation docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">text2text-generation</div>
                            Supported models:
                            <code>google/flan-t5-small</code>,
                            <code>google/flan-t5-base</code>,
                            <code>t5-small</code>,
                            <code>t5-base</code>,
                            <code>google/t5-v1_1-small</code>,
                            <code>google/t5-v1_1-base</code>,
                            <code>google/mt5-small</code>,
                            <code>facebook/bart-large-cnn</code>,
                            <code>sshleifer/distilbart-cnn-6-6</code>,
                            <code>sshleifer/distilbart-cnn-12-6</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/tasks/text-generation#text-to-text-generation-models">
                                Text Generation docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">text-generation</div>
                            Supported models:
                            <code>gpt2</code>,
                            <code>distilgpt2</code>,
                            <code>EleutherAI/gpt-neo-125M</code>,
                            <code>Salesforce/codegen-350M-mono</code>,
                            <code>Salesforce/codegen-350M-multi</code>,
                            <code>Salesforce/codegen-350M-nl</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/tasks/text-generation#completion-generation-models">
                                Text Generation docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">automatic-speech-recognition</div>
                            Supported models:
                            <code>openai/whisper-tiny.en</code>,
                            <code>openai/whisper-tiny</code>,
                            <code>openai/whisper-small.en</code>,
                            <code>openai/whisper-small</code>,
                            <code>openai/whisper-base.en</code>,
                            <code>openai/whisper-base</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/tasks/asr">
                                Automatic Speech Recognition docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">image-to-text</div>
                            Supported models:
                            <code>nlpconnect/vit-gpt2-image-captioning</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/tasks/image-to-text">
                                Image-to-Text docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">image-classification</div>
                            Supported models:
                            <code>google/vit-base-patch16-224</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/tasks/image_classification">
                                Image Classification docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">zero-shot-image-classification</div>
                            Supported models:
                            <code>openai/clip-vit-base-patch16</code>,
                            <code>openai/clip-vit-base-patch32</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/tasks/zero-shot-image-classification">
                                Zero-Shot Image Classification</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">object-detection</div>
                            Supported models: <code>facebook/detr-resnet-50</code>,
                            <code>facebook/detr-resnet-101</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/tasks/object-detection">
                                Object detection docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">embeddings</div>
                            Supported models:
                            <code>sentence-transformers/all-MiniLM-L6-v2</code>,
                            <code>sentence-transformers/all-MiniLM-L12-v2</code>,
                            <code>sentence-transformers/all-distilroberta-v1</code>,
                            <code>sentence-transformers/paraphrase-albert-base-v2</code>,
                            <code>sentence-transformers/paraphrase-albert-small-v2</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/blog/getting-started-with-embeddings">
                                Embeddings docs</a>.
                        </div>
                    </li>
                </ol>
                <br>
                <p class="lead mb-2">The following
                    <a href="https://huggingface.co/docs/transformers/model_summary">model types</a>
                    are supported:
                </p>
                <ol class="list-group list-group-numbered">
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">BERT</div>
                            Tasks: Masked language modelling
                            (<code>AutoModelForMaskedLM</code>),
                            question answering
                            (<code>AutoModelForQuestionAnswering</code>), and
                            sequence classification
                            (<code>AutoModelForSequenceClassification</code>).
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/bert">BERT docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">ALBERT</div>
                            Tasks: Masked language modelling
                            <code>(AutoModelForMaskedLM)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/albert">ALBERT docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">DistilBERT</div>
                            Tasks: Masked language modelling
                            <code>(AutoModelForMaskedLM)</code>,
                            question answering
                            <code>(AutoModelForQuestionAnswering)</code>, and
                            sequence classification
                            <code>(AutoModelForSequenceClassification)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/distilbert">DistilBERT
                                docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">T5</div>
                            Tasks: Sequence-to-sequence for
                            translation/summarization
                            <code>(AutoModelForSeq2SeqLM)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/t5">T5 docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">T5v1.1</div>
                            Tasks: Sequence-to-sequence
                            <code>(AutoModelForSeq2SeqLM)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/t5v1.1">T5v1.1 docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">FLAN-T5</div>
                            Tasks: Sequence-to-sequence for over 1000 tasks
                            <code>(AutoModelForSeq2SeqLM)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/flan-t5">FLAN-T5 docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">mT5</div>
                            Tasks: Sequence-to-sequence 
                            <code>(AutoModelForSeq2SeqLM)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/mt5">mT5 docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">GPT2/DistilGPT2</div>
                            Tasks: Text generation
                            <code>(AutoModelForCausalLM)</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/model_doc/gpt2">GPT2 docs</a> or
                            <a href="https://huggingface.co/distilgpt2">DistilGPT2 docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">GPT Neo</div>
                            Tasks: Text generation
                            <code>(AutoModelForCausalLM)</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/model_doc/gpt_neo">GPT Neo docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">BART</div>
                            Tasks: Sequence-to-sequence for summarization
                            <code>(AutoModelForSeq2SeqLM)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/bart">BART docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">CodeGen</div>
                            Tasks: Text generation
                            <code>(AutoModelForCausalLM)</code>.
                            For more information, check out the
                            <a href="https://huggingface.co/docs/transformers/model_doc/codegen">CodeGen docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">Whisper</div>
                            Tasks: Automatic speech recognition
                            <code>(AutoModelForSeq2SeqLM)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/whisper">Whisper docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">CLIP</div>
                            Tasks: Zero-shot Image classification
                            <code>(AutoModel)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/clip">CLIP
                                docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">Vision Transformer (ViT)</div>
                            Tasks: Image classification
                            <code>(AutoModelForImageClassification)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/vit">Vision Transformer
                                docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">VisionEncoderDecoderModel</div>
                            Tasks: Image to text
                            <code>(AutoModelForVision2Seq)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/vision-encoder-decoder">Vision
                                Encoder Decoder Models docs</a>.
                        </div>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">DETR</div>
                            Tasks: Object detection
                            <code>(AutoModelForObjectDetection)</code>.
                            For more information, check out the <a
                                href="https://huggingface.co/docs/transformers/model_doc/detr">DETR docs</a>.
                        </div>
                    </li>
                </ol>
                <br>
                <p class="mb-2">Don't see your model type or task supported? Raise an
                    <a href="https://github.com/xenova/transformers.js/issues/new">issue</a> on GitHub, and if there's
                    enough demand, we will add it!

                    <br>
                    <br>
                    We use <a href="https://onnxruntime.ai/">ONNX Runtime</a> to run the
                    models in the browser, so you must first convert your PyTorch model to ONNX (which can be done using
                    our
                    <a href="https://github.com/xenova/transformers.js/blob/main/scripts/convert.py">conversion
                        script</a>).
                </p>
            </div>
        </div>
    </section>

    <!-- Examples section-->
    <section class="py-4 border-bottom" id="examples">
        <div class="container px-5 my-4">
            <div class="mb-3">
                <h2 class="fw-bolder">Examples</h2>
            </div>
            <div class="row gx-5 justify-content-center">
                <div class="col-lg-12 mb-3">
                    <em>Coming soon... In the meantime, check out the source code for the demo
                        <a href="https://github.com/xenova/transformers.js/blob/main/assets/js/worker.js">here</a>.</em>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer-->
    <footer class="py-3 bg-dark">
        <div class="container px-5">
            <p class="m-0 text-center text-white">Copyright &copy; Xenova 2023</p>
        </div>
    </footer>

</body>


</html>