import os
import yaml
from pathlib import Path

# Add project root to sys.path to import from database
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.seed_programs import PROGRAMS

CONTENT_DIR = Path(__file__).parent / "content-api" / "content" / "programs"

def generate_yamls():
    index_data = {"programs": []}
    
    # Usuwamy stare pliki yaml żeby nie było śmieci
    for f in CONTENT_DIR.glob("*.yaml"):
        f.unlink()
        
    for prog in PROGRAMS:
        # Dodajemy do index.yaml
        index_data["programs"].append({
            "id": prog["id"],
            "name": prog["name"]
        })
        
        # Tworzymy plik YAML dla programu
        yaml_path = CONTENT_DIR / f"{prog['id']}.yaml"
        
        program_data = {
            "program_id": prog["id"],
            "title": prog["name"],
            "description": prog["description"] + "\n",
            "image_src": f"/programs/{prog['image_local']}",
            "form": {
                "form_id": f"recruitment-program-{prog['id']}",
                "version": "1.0",
                "screens": [
                    {
                        "id": 1,
                        "title": "Formularz rekrutacyjny",
                        "subtitle": f"Uzupełnij zgłoszenie na kierunek {prog['name']}.",
                        "primary_action": "program.defaultSubmit",
                        "fields": [
                            {
                                "id": "candidate_first_name",
                                "type": "text",
                                "label": "Imię",
                                "placeholder": "np. Jan",
                                "required": True
                            },
                            {
                                "id": "candidate_last_name",
                                "type": "text",
                                "label": "Nazwisko",
                                "placeholder": "np. Kowalski",
                                "required": True
                            },
                            {
                                "id": "candidate_email",
                                "type": "email",
                                "label": "E-mail kontaktowy",
                                "placeholder": "kandydat@example.com",
                                "required": True
                            },
                            {
                                "id": "study_mode_confirm",
                                "type": "checkbox",
                                "label": f"Potwierdzam zainteresowanie studiami ({prog['mode']})",
                                "required": True
                            }
                        ],
                        "button_text": "Wyślij zgłoszenie"
                    }
                ]
            }
        }
        
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(program_data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
            
    # Zapisujemy index.yaml
    with open(CONTENT_DIR / "index.yaml", "w", encoding="utf-8") as f:
        yaml.dump(index_data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
        
    print(f"Wygenerowano {len(PROGRAMS)} plików YAML dla kierunków oraz index.yaml")

if __name__ == "__main__":
    generate_yamls()
