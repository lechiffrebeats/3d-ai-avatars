<script>
  import svelteLogo from "$lib/images/logos/svelte.svg";
  import vercelLogo from "$lib/images/logos/vercel.svg";
  import cloudflareLogo from "$lib/images/logos/cloudflare.svg";
  import supabaseLogo from "$lib/images/logos/supabase.png";
  import threeLogo from "$lib/images/logos/three.png";
  import pythonLogo from "$lib/images/logos/python.svg";
  import nginxLogo from "$lib/images/logos/nginx.svg";
  import gunicornLogo from "$lib/images/logos/gunicorn.svg";
  import gwdgLogo from "$lib/images/logos/gwdg_logo.min.svg";
  import allosaurusLogo from "$lib/images/logos/channels4_profile.jpg";
  import openaiLogo from "$lib/images/logos/openai.svg";
  import coquiLogo from "$lib/images/logos/Coqui.png";
  import bfa from "$lib/images/logos/bfa.jpg";
</script>

<div class="tech-list">
  <div>
    <img src={svelteLogo} alt="SvelteKit" />
    <a href="https://kit.svelte.dev/" target="_blank" rel="noopener noreferrer"
      >SvelteKit</a
    > Frontend
  </div>
  <div>
    <img src={vercelLogo} alt="Vercel" />
    <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer"
      >Vercel</a
    > Client Hosting
  </div>
  <div>
    <img src={cloudflareLogo} alt="Cloudflare" />
    <a
      href="https://www.cloudflare.com/"
      target="_blank"
      rel="noopener noreferrer">Cloudflare</a
    > Protection
  </div>
  <div>
    <img src={supabaseLogo} alt="Supabase" />
    <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer"
      >Supabase</a
    > für Evaluation (DE Server)
  </div>
  <div>
    <img src={threeLogo} alt="Three.js" />
    <a href="https://threejs.org/" target="_blank" rel="noopener noreferrer"
      >Three.js</a
    > für alles 3D
  </div>
  <div>
    <img src={pythonLogo} alt="Flask" />
    <a
      href="https://flask.palletsprojects.com/"
      target="_blank"
      rel="noopener noreferrer">Python/Flask</a
    > Server
  </div>
  <div>
    <img src={nginxLogo} alt="Nginx" />
    <a href="https://nginx.org/" target="_blank" rel="noopener noreferrer"
      >Nginx</a
    >
    /
    <img src={gunicornLogo} alt="Gunicorn" />
    <a href="https://gunicorn.org/" target="_blank" rel="noopener noreferrer"
      >Gunicorn</a
    > Server Hosting
  </div>
  <div>
    <img src={gwdgLogo} alt="ARCANA" />
    <a
      href="https://docs.hpc.gwdg.de/services/arcana/index.html"
      target="_blank"
      rel="noopener noreferrer">ARCANA (HPC GWDG)</a
    > RAG
  </div>
  <div>
    <img src={bfa} alt="Allosaurus" />
    <a
      href="https://github.com/tabahi/bournemouth-forced-aligner"
      target="_blank"
      rel="noopener noreferrer">Bournemouth Forced Aligner (BFA)</a
    > Phonemes
  </div>
  <div>
    <img src={openaiLogo} alt="Whisper" />
    <a
      href="https://platform.openai.com/research/whisper"
      target="_blank"
      rel="noopener noreferrer">Whisper (OpenAI)</a
    > STT
  </div>
  <div>
    <img src={coquiLogo} alt="Coqui" />
    <a
      href="https://github.com/coqui-ai/TTS"
      target="_blank"
      rel="noopener noreferrer">Coqui TTS</a
    >
  </div>
</div>

<section>
  For Full List of Software use see <a href="/about?p=oss">Licences</a>
</section>

<style>
  .tech-list {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
    margin: 0;
  }
  .tech-list div {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 4px 0;
    border: 0.1px solid gray;
    border-radius: 8px;
    padding: 2px;
  }

  .tech-list img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .tech-list a {
    color: #0066cc;
    text-decoration: none;
  }

  .tech-list a:hover {
    text-decoration: underline;
  }
</style>
