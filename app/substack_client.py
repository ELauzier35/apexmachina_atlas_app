import os
from substack import Api
from substack.post import Post

from dotenv import load_dotenv

# charge .env si nécessaire (utile pour les scripts)
load_dotenv()

SUBSTACK_EMAIL = os.environ.get("SUBSTACK_EMAIL")
SUBSTACK_PASSWORD = os.environ.get("SUBSTACK_PASSWORD")
SUBSTACK_PUBLICATION_URL = os.environ.get("SUBSTACK_PUBLICATION_URL")


def get_substack_api() -> Api:
    """
    Initialise le client Substack.
    Utilise email/password et éventuellement l'URL de la publication.
    """
    if not SUBSTACK_EMAIL or not SUBSTACK_PASSWORD:
        raise RuntimeError("SUBSTACK_EMAIL ou SUBSTACK_PASSWORD manquants dans .env")

    api = Api(
        email=SUBSTACK_EMAIL,
        password=SUBSTACK_PASSWORD,
        # si la lib supporte publication_url, tu peux ajouter :
        # publication_url=SUBSTACK_PUBLICATION_URL,
    )
    return api


def publish_to_substack(title: str, subtitle: str | None, body_markdown: str, send_email: bool = True) -> str:
    """
    Crée un draft puis le publie sur Substack.
    Retourne l'URL du post publié.
    """
    api = get_substack_api()

    # Récupère l'ID de l'utilisateur (requis par la lib)
    user_id = api.get_user_id()

    # Crée l'objet Post (côté lib)
    post = Post(
        title=title,
        subtitle=subtitle or "",
        user_id=user_id,
    )

    # Ajoute le contenu en markdown (ou texte simple)
    post.add({
        "type": "paragraph",
        "content": body_markdown,
    })

    # Envoie le draft à Substack
    draft = api.post_draft(post.body)

    # Publie le draft : send=True => envoi email aux abonnés
    published = api.publish_draft(draft.get("id"), send=send_email)

    # L’objet renvoyé contient normalement l’URL du post
    url = published.get("url")
    return url