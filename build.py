from pathlib import Path
import base64,json,mimetypes
files={}
for p in Path('public').rglob('*'):
 if p.is_file():
  path='/'+p.relative_to('public').as_posix()
  files[path]=['application/manifest+json' if path.endswith('.webmanifest') else (mimetypes.guess_type(path)[0] or 'application/octet-stream'),base64.b64encode(p.read_bytes()).decode()]
out=Path('dist/server/index.js')
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text('const files='+json.dumps(files)+';\nconst seed='+Path('worker/seed.json').read_text()+';\n'+Path('public/measurements.js').read_text()+'\n'+Path('public/delivery.js').read_text()+'\n'+Path('worker/orders.mjs').read_text()+'\n'+Path('worker/chat.mjs').read_text()+'\n'+Path('worker/storage.mjs').read_text()+'\n'+Path('worker/handler.mjs').read_text())
