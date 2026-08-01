"""
PhoenixBank - HashiCorp Vault Secrets Client (Phase 7)
"""

import requests
import os

class VaultClient:
    def __init__(self, vault_url: str = "http://localhost:8200", token: str = "phoenix-master-token"):
        self.vault_url = vault_url
        self.token = token
        self.headers = {"X-Vault-Token": self.token}

    def get_secret(self, path: str = "secret/data/phoenix/ledger") -> dict:
        url = f"{self.vault_url}/v1/{path}"
        try:
            response = requests.get(url, headers=self.headers, timeout=3)
            if response.status_code == 200:
                return response.json().get("data", {}).get("data", {})
            else:
                print(f"Vault API Returned status {response.status_code}")
                return {}
        except Exception as e:
            print(f"Failed to connect to Vault at {self.vault_url}: {e}")
            return {}

if __name__ == "__main__":
    client = VaultClient()
    print("Testing Vault Secrets Retrieval...")
    secrets = client.get_secret()
    print("Retrieved Secrets from Vault:", secrets)
