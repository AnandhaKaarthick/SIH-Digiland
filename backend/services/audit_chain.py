import hashlib
import json
import datetime

class AuditChainService:
    """
    Cryptographic SHA-256 Hash Chain Service & Ed25519/ECDSA Signature Simulator.
    Ensures tamper-evident immutability and non-repudiation for revenue officer approvals.
    """

    GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    @staticmethod
    def calculate_block_hash(previous_hash: str, payload: dict) -> str:
        """
        Computes SHA-256 hash: H_n = SHA-256(H_{n-1} + Serialized_Payload)
        """
        serialized = json.dumps(payload, sort_keys=True)
        block = f"{previous_hash}{serialized}".encode("utf-8")
        return hashlib.sha256(block).hexdigest()

    @staticmethod
    def generate_digital_signature(officer_role: str, record_hash: str) -> str:
        """
        Simulates Ed25519 / ECDSA-SHA256 digital signature for non-repudiation.
        """
        sig_body = f"OFFICER_KEY_{officer_role.upper()}:{record_hash}:{datetime.datetime.utcnow().isoformat()}".encode("utf-8")
        sig_hash = hashlib.sha256(sig_body).hexdigest()[:24]
        return f"Ed25519-SIG:{sig_hash}"

    @classmethod
    def verify_chain_integrity(cls, audit_records: list[dict]) -> dict:
        """
        Validates structural integrity of an append-only audit trail chain.
        Returns detailed status report indicating whether tampering occurred.
        """
        if not audit_records:
            return {"valid": True, "details": "Chain is empty; valid zero state."}

        for i in range(len(audit_records)):
            current = audit_records[i]
            prev_hash = audit_records[i-1]["current_hash"] if i > 0 else cls.GENESIS_HASH

            # Check 1: Previous hash link must match
            if current["previous_hash"] != prev_hash:
                return {
                    "valid": False,
                    "tampered_at_index": i,
                    "tampered_history_id": current.get("history_id"),
                    "details": f"Chain Broken! Row {i} previous_hash ({current['previous_hash'][:10]}...) does not match Row {i-1} current_hash ({prev_hash[:10]}...)."
                }

            # Check 2: Recompute block hash
            payload = {
                "record_id": current["record_id"],
                "action": current["action"],
                "field_changed": current["field_changed"],
                "new_value": current["new_value"],
                "actor_name": current["actor_name"]
            }
            expected_hash = cls.calculate_block_hash(prev_hash, payload)
            if current["current_hash"] != expected_hash:
                return {
                    "valid": False,
                    "tampered_at_index": i,
                    "tampered_history_id": current.get("history_id"),
                    "details": f"Data Tampering Detected! Block hash mismatch at Row {i} (Record {current['record_id']}). Recomputed SHA-256 does not match stored block hash."
                }

        return {
            "valid": True,
            "total_blocks": len(audit_records),
            "latest_block_hash": audit_records[-1]["current_hash"],
            "details": f"Hash Chain Verified! All {len(audit_records)} blocks pass SHA-256 integrity checks with zero tampering."
        }
