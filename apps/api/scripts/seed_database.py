import asyncio
import json
import sys
import uuid
from decimal import Decimal
from pathlib import Path

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

apps_api_dir = Path(r"C:\Users\surya\.gemini\antigravity\scratch\land-governance-platform\apps\api")
sys.path.insert(0, str(apps_api_dir))

from app.core.config import settings
from app.db.session import AsyncSessionFactory
from sqlalchemy import text

async def seed_empty_tables():
    print("Connecting to Supabase database...")
    async with AsyncSessionFactory() as db:
        # 1. Fetch available users
        user_res = await db.execute(text("SELECT id FROM users ORDER BY is_superuser DESC, created_at ASC LIMIT 1"))
        admin_user_id = user_res.scalar()
        if not admin_user_id:
            raise RuntimeError("No user found in database to assign as creator/actor.")
        print(f"Assigning admin user {admin_user_id} as actor.")

        # 2. Fetch resource versions by type/title
        rv_res = await db.execute(text("""
            SELECT rv.id, r.id as res_id, r.title, r.resource_type
            FROM resource_versions rv
            JOIN resources r ON rv.resource_id = r.id
        """))
        versions_by_type = {}
        versions_by_title = {}
        for rvid, resid, title, rtype in rv_res.fetchall():
            versions_by_type.setdefault(rtype, []).append((rvid, resid, title))
            versions_by_title[title] = rvid

        print(f"Loaded {len(rv_res.fetchall()) + len(versions_by_title)} resource versions.")

        # Find spatial layer versions
        national_cadastre_rv = versions_by_title.get("National Cadastral Parcel Polygons and Boundary Reconciliations 2026")
        motihari_rv = versions_by_title.get("Motihari")
        gui_layers_rv = versions_by_title.get("GUI Layers")

        # Fallbacks if exact titles differ
        spatial_rvs = versions_by_type.get("spatial_layer", []) + versions_by_type.get("dataset", [])
        if not national_cadastre_rv and spatial_rvs:
            national_cadastre_rv = spatial_rvs[0][0]
        if not motihari_rv and len(spatial_rvs) > 1:
            motihari_rv = spatial_rvs[1][0]
        if not gui_layers_rv and len(spatial_rvs) > 2:
            gui_layers_rv = spatial_rvs[2][0]

        # -------------------------------------------------------------
        # A. POPULATE spatial_features
        # -------------------------------------------------------------
        print("\n--- Seeding spatial_features ---")
        features_to_seed = [
            # 1. Delhi Central Cadastral Zone
            {
                "layer_version_id": national_cadastre_rv,
                "external_id": "PAR-DEL-01",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[77.205, 28.611], [77.215, 28.611], [77.215, 28.618], [77.205, 28.618], [77.205, 28.611]]
                    ]
                },
                "properties": {
                    "name": "Delhi Central Cadastral Zone",
                    "surveyNumber": "Survey DL-01/Central",
                    "owner": "Delhi Development Authority & Public Estate",
                    "areaHa": 6.2,
                    "tenureType": "Institutional Freehold",
                    "jurisdiction": "Delhi (Central District)",
                    "mutationDate": "15 August 2026",
                    "coordinates": "28.6139° N, 77.2090° E",
                    "status": "Verified Conclusive Title"
                }
            },
            # 2. Bhopal Urban Cadastral Division
            {
                "layer_version_id": national_cadastre_rv,
                "external_id": "PAR-BPL-74",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[77.408, 23.256], [77.419, 23.256], [77.419, 23.265], [77.408, 23.265], [77.408, 23.256]]
                    ]
                },
                "properties": {
                    "name": "Bhopal Urban Cadastral Division",
                    "surveyNumber": "Survey MP-BPL/74",
                    "owner": "Madhya Pradesh State Land Revenue Dept",
                    "areaHa": 8.5,
                    "tenureType": "Municipal Land Trust",
                    "jurisdiction": "Madhya Pradesh (Bhopal)",
                    "mutationDate": "10 July 2026",
                    "coordinates": "23.2599° N, 77.4126° E",
                    "status": "Verified Municipal Record"
                }
            },
            # 3. Pune Agricultural Parcel 142/3A
            {
                "layer_version_id": national_cadastre_rv,
                "external_id": "PAR-44029",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[73.854, 18.518], [73.861, 18.518], [73.861, 18.524], [73.854, 18.524], [73.854, 18.518]]
                    ]
                },
                "properties": {
                    "name": "Pune Agricultural Parcel 142/3A",
                    "surveyNumber": "Survey 142/3A",
                    "owner": "Ramesh K. Joshi & Co-owners",
                    "areaHa": 4.85,
                    "tenureType": "Freehold Agricultural",
                    "jurisdiction": "Maharashtra (Pune)",
                    "mutationDate": "12 August 2026",
                    "coordinates": "18.5204° N, 73.8567° E",
                    "status": "Active 7/12 Mutation"
                }
            },
            # 4. Bangalore Ecological Buffer 88/1
            {
                "layer_version_id": national_cadastre_rv,
                "external_id": "PAR-12093",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[77.591, 12.968], [77.601, 12.968], [77.601, 12.975], [77.591, 12.975], [77.591, 12.968]]
                    ]
                },
                "properties": {
                    "name": "Bangalore Ecological Buffer 88/1",
                    "surveyNumber": "Survey 88/1",
                    "owner": "Bangalore Metropolitan Land Trust",
                    "areaHa": 12.4,
                    "tenureType": "Communal Forest Buffer",
                    "jurisdiction": "Karnataka (Bangalore Rural)",
                    "mutationDate": "24 July 2026",
                    "coordinates": "12.9716° N, 77.5946° E",
                    "status": "Protected Buffer Zone"
                }
            },
            # 5. Odisha Mayurbhanj Forest Tenure
            {
                "layer_version_id": national_cadastre_rv,
                "external_id": "PAR-OD-501",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[86.720, 21.930], [86.735, 21.930], [86.735, 21.942], [86.720, 21.942], [86.720, 21.930]]
                    ]
                },
                "properties": {
                    "name": "Mayurbhanj Community Forest Parcel",
                    "surveyNumber": "Survey OR-501/FRA",
                    "owner": "Simlipal Adivasi Gram Sabha Federation",
                    "areaHa": 15.2,
                    "tenureType": "Community Forest Rights (FRA 2006)",
                    "jurisdiction": "Odisha (Mayurbhanj)",
                    "mutationDate": "04 May 2026",
                    "coordinates": "21.9360° N, 86.7275° E",
                    "status": "Vested Title Deed"
                }
            },
            # 6. Amaravati Capital Cadastral Zone
            {
                "layer_version_id": national_cadastre_rv,
                "external_id": "PAR-AP-312",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[80.510, 16.510], [80.525, 16.510], [80.525, 16.522], [80.510, 16.522], [80.510, 16.510]]
                    ]
                },
                "properties": {
                    "name": "Amaravati Land Pooling Cadastral Unit",
                    "surveyNumber": "Survey AP-CR-312",
                    "owner": "Andhra Pradesh CRDA Pooling Trust",
                    "areaHa": 7.8,
                    "tenureType": "Land Pooling Ownership Certificate",
                    "jurisdiction": "Andhra Pradesh (Guntur)",
                    "mutationDate": "18 June 2026",
                    "coordinates": "16.5160° N, 80.5175° E",
                    "status": "Pooled Urban Reconstituted"
                }
            },
            # 7. Jaipur Semi-Arid Agricultural Parcel
            {
                "layer_version_id": national_cadastre_rv,
                "external_id": "PAR-RJ-108",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[75.780, 26.910], [75.795, 26.910], [75.795, 26.920], [75.780, 26.920], [75.780, 26.910]]
                    ]
                },
                "properties": {
                    "name": "Jaipur Agro-Pastoral Consolidation",
                    "surveyNumber": "Survey RJ-JP-108",
                    "owner": "Bhanwar Lal Shekhawat",
                    "areaHa": 9.6,
                    "tenureType": "Freehold Khatedari",
                    "jurisdiction": "Rajasthan (Jaipur)",
                    "mutationDate": "22 March 2026",
                    "coordinates": "26.9150° N, 75.7875° E",
                    "status": "Consolidated Cadastre"
                }
            },
            # 8. Motihari Agricultural Cadastre (Bihar)
            {
                "layer_version_id": motihari_rv or national_cadastre_rv,
                "external_id": "PAR-MTH-01",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[84.910, 26.640], [84.922, 26.640], [84.922, 26.650], [84.910, 26.650], [84.910, 26.640]]
                    ]
                },
                "properties": {
                    "name": "Motihari Sugarcane Belt Cadastre",
                    "surveyNumber": "Survey 204/B",
                    "owner": "Champaran Kisan Cooperative",
                    "areaHa": 3.4,
                    "tenureType": "Raiyati Agricultural",
                    "jurisdiction": "Bihar (East Champaran)",
                    "mutationDate": "14 February 2026",
                    "coordinates": "26.6450° N, 84.9160° E",
                    "status": "Special Survey Surveyed"
                }
            },
            # 9. Motihari Commercial Sub-Division
            {
                "layer_version_id": motihari_rv or national_cadastre_rv,
                "external_id": "PAR-MTH-02",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[84.925, 26.642], [84.935, 26.642], [84.935, 26.649], [84.925, 26.649], [84.925, 26.642]]
                    ]
                },
                "properties": {
                    "name": "Motihari Station Road Sub-Division",
                    "surveyNumber": "Survey 205/A",
                    "owner": "District Municipal Council",
                    "areaHa": 1.8,
                    "tenureType": "Commercial Leasehold",
                    "jurisdiction": "Bihar (East Champaran)",
                    "mutationDate": "09 January 2026",
                    "coordinates": "26.6455° N, 84.9300° E",
                    "status": "Commercial Allotment"
                }
            },
            # 10. GUI Layer Pune North Overlay
            {
                "layer_version_id": gui_layers_rv or national_cadastre_rv,
                "external_id": "GUI-PUN-01",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[73.865, 18.530], [73.875, 18.530], [73.875, 18.540], [73.865, 18.540], [73.865, 18.530]]
                    ]
                },
                "properties": {
                    "name": "Haveli Sub-division Cadastral Grid",
                    "surveyNumber": "Survey 145/2B",
                    "owner": "Maharashtra Industrial Development Corp",
                    "areaHa": 3.2,
                    "tenureType": "Industrial Leasehold",
                    "jurisdiction": "Maharashtra (Pune)",
                    "mutationDate": "02 August 2026",
                    "coordinates": "18.5350° N, 73.8700° E",
                    "status": "MIDC High-precision Grid"
                }
            }
        ]

        spatial_insert_query = text("""
            INSERT INTO spatial_features (layer_version_id, external_id, geom, properties)
            VALUES (
                :layer_version_id,
                :external_id,
                extensions.ST_SetSRID(extensions.ST_GeomFromGeoJSON(:geom_geojson), 4326),
                CAST(:props AS jsonb)
            )
            ON CONFLICT (layer_version_id, external_id) DO UPDATE 
            SET properties = EXCLUDED.properties,
                geom = EXCLUDED.geom;
        """)

        for feat in features_to_seed:
            await db.execute(spatial_insert_query, {
                "layer_version_id": feat["layer_version_id"],
                "external_id": feat["external_id"],
                "geom_geojson": json.dumps(feat["geometry"]),
                "props": json.dumps(feat["properties"])
            })
        await db.commit()
        print(f"Successfully seeded {len(features_to_seed)} spatial features into spatial_features!")

        # -------------------------------------------------------------
        # B. POPULATE provenance_activities
        # -------------------------------------------------------------
        print("\n--- Seeding provenance_activities ---")
        activities_to_seed = [
            {
                "id": str(uuid.uuid4()),
                "activity_type": "cadastral_survey_ingestion",
                "status": "completed",
                "actor_user_id": str(admin_user_id),
                "actor_name": "Bhoomitra Drone Cadastral Ingestion Pipeline",
                "software_name": "GDAL / PostGIS Spatial Processor",
                "software_version": "3.8.4",
                "parameters": {
                    "crs": "EPSG:4326",
                    "tolerance_meters": 0.05,
                    "survey_methodology": "RTK-GPS Drone Photogrammetry"
                },
                "environment": {
                    "engine": "PostGIS 3.4 on PostgreSQL 15",
                    "platform": "Bhoomitra OS Core"
                },
                "request_id": "REQ-CAD-ING-001"
            },
            {
                "id": str(uuid.uuid4()),
                "activity_type": "policy_ratification_review",
                "status": "completed",
                "actor_user_id": str(admin_user_id),
                "actor_name": "Department of Land Resources Legal Committee",
                "software_name": "Bhoomitra Statutory Drafting Module",
                "software_version": "2.1.0",
                "parameters": {
                    "legal_harmonization": "National Land Records Modernization Directive",
                    "clause_count": 48
                },
                "environment": {
                    "legislative_framework": "DILRMP Conclusive Titling Guidelines"
                },
                "request_id": "REQ-POL-REV-002"
            },
            {
                "id": str(uuid.uuid4()),
                "activity_type": "peer_review_validation",
                "status": "completed",
                "actor_user_id": str(admin_user_id),
                "actor_name": "International Journal of Land Administration Editorial Board",
                "software_name": "OpenJournal Double-Blind Review Engine",
                "software_version": "3.3.0",
                "parameters": {
                    "reviewers_assigned": 3,
                    "consensus_score": 9.4,
                    "methodology_rigor": "Optimal"
                },
                "environment": {
                    "academic_indexer": "Scopus / Land Governance Index"
                },
                "request_id": "REQ-PEER-VAL-003"
            },
            {
                "id": str(uuid.uuid4()),
                "activity_type": "spatial_topology_verification",
                "status": "completed",
                "actor_user_id": str(admin_user_id),
                "actor_name": "Survey of India PostGIS Topology Validator",
                "software_name": "PostGIS Topology Engine",
                "software_version": "3.4.1",
                "parameters": {
                    "rules": ["ST_IsValid", "ST_Overlaps = FALSE", "Polygon Closure", "Sliver Gap Elimination"],
                    "polygons_checked": 10,
                    "errors_detected": 0
                },
                "environment": {
                    "srid": 4326,
                    "precision_model": "Double Precision Floating Point"
                },
                "request_id": "REQ-TOPO-VER-004"
            },
            {
                "id": str(uuid.uuid4()),
                "activity_type": "evidence_synthesis_extraction",
                "status": "completed",
                "actor_user_id": str(admin_user_id),
                "actor_name": "Bhoomitra Knowledge & AI Intelligence Engine",
                "software_name": "Google Gemini 1.5 Flash Knowledge Extractor",
                "software_version": "1.5.0",
                "parameters": {
                    "extraction_schema": "empirical_claim_v2",
                    "confidence_threshold": 0.85
                },
                "environment": {
                    "ai_engine": "Gemini Knowledge Integration"
                },
                "request_id": "REQ-EVI-EXT-005"
            }
        ]

        activity_insert_query = text("""
            INSERT INTO provenance_activities (
                id, activity_type, status, actor_user_id, actor_name, 
                software_name, software_version, parameters, environment, request_id, 
                started_at, completed_at
            )
            VALUES (
                :id, :activity_type, CAST(:status AS provenance_activity_status), 
                :actor_user_id, :actor_name, :software_name, :software_version, 
                CAST(:parameters AS jsonb), CAST(:environment AS jsonb), :request_id, 
                now() - interval '2 days', now() - interval '1 day'
            )
            ON CONFLICT (id) DO NOTHING;
        """)

        created_activity_ids = []
        for act in activities_to_seed:
            await db.execute(activity_insert_query, {
                "id": act["id"],
                "activity_type": act["activity_type"],
                "status": act["status"],
                "actor_user_id": act["actor_user_id"],
                "actor_name": act["actor_name"],
                "software_name": act["software_name"],
                "software_version": act["software_version"],
                "parameters": json.dumps(act["parameters"]),
                "environment": json.dumps(act["environment"]),
                "request_id": act["request_id"]
            })
            created_activity_ids.append(act["id"])
        await db.commit()
        print(f"Successfully seeded {len(created_activity_ids)} activities into provenance_activities!")

        # -------------------------------------------------------------
        # C. POPULATE provenance_edges
        # -------------------------------------------------------------
        print("\n--- Seeding provenance_edges ---")
        # Fetch research paper and policy versions
        papers = versions_by_type.get("research_paper", [])
        policies = versions_by_type.get("policy", [])
        datasets = versions_by_type.get("dataset", [])

        edges_to_seed = []
        if len(papers) >= 2 and national_cadastre_rv:
            # Paper 1 uses cadastral dataset
            edges_to_seed.append({
                "source_version_id": str(papers[0][0]),
                "target_version_id": str(national_cadastre_rv),
                "activity_id": created_activity_ids[0],
                "relationship": "uses_data",
                "source_locator": {"table": "spatial_features", "parcels": ["PAR-DEL-01", "PAR-44029"]},
                "notes": "Empirical cadastral boundaries used as ground truth for spatial analytics."
            })
        if len(papers) >= 3 and len(policies) >= 1:
            # Paper 2 validates Policy 1
            edges_to_seed.append({
                "source_version_id": str(papers[1][0]),
                "target_version_id": str(policies[0][0]),
                "activity_id": created_activity_ids[1],
                "relationship": "validates",
                "source_locator": {"section": "Policy Impact Analysis", "clauses": [4, 12, 19]},
                "notes": "Academic evaluation validating the socio-economic outcomes of the digital cadastre directive."
            })
        if len(papers) >= 4:
            # Paper 3 derived from Paper 1
            edges_to_seed.append({
                "source_version_id": str(papers[2][0]),
                "target_version_id": str(papers[0][0]),
                "activity_id": created_activity_ids[2],
                "relationship": "derived_from",
                "source_locator": {"section": "Methodology", "algorithm": "Cadastral Boundary Resolution Matrix"},
                "notes": "Extends Western Ghats tenure dispute resolution framework to rural Karnataka agricultural credit study."
            })
        if len(policies) >= 2 and national_cadastre_rv:
            # Policy 2 uses cadastral dataset
            edges_to_seed.append({
                "source_version_id": str(policies[0][0]),
                "target_version_id": str(national_cadastre_rv),
                "activity_id": created_activity_ids[3],
                "relationship": "uses_data",
                "source_locator": {"annexure": "Cadastral Map Specifications", "scale": "1:1000"},
                "notes": "Statutory parcel mapping standard mandated by National Digital Cadastre Modernization Directive."
            })

        edge_insert_query = text("""
            INSERT INTO provenance_edges (
                id, source_version_id, target_version_id, activity_id, 
                relationship, source_locator, notes, created_by_id
            )
            VALUES (
                :id, :source_version_id, :target_version_id, :activity_id, 
                CAST(:relationship AS provenance_relation), 
                CAST(:source_locator AS jsonb), :notes, :created_by_id
            )
            ON CONFLICT DO NOTHING;
        """)

        for edge in edges_to_seed:
            await db.execute(edge_insert_query, {
                "id": str(uuid.uuid4()),
                "source_version_id": edge["source_version_id"],
                "target_version_id": edge["target_version_id"],
                "activity_id": edge["activity_id"],
                "relationship": edge["relationship"],
                "source_locator": json.dumps(edge["source_locator"]),
                "notes": edge["notes"],
                "created_by_id": str(admin_user_id)
            })
        await db.commit()
        print(f"Successfully seeded {len(edges_to_seed)} provenance edges into provenance_edges!")

        # -------------------------------------------------------------
        # D. POPULATE evidence_claims
        # -------------------------------------------------------------
        print("\n--- Seeding evidence_claims ---")
        claims_to_seed = []
        policy_rv = policies[0][0] if policies else national_cadastre_rv
        paper1_rv = papers[0][0] if len(papers) > 0 else national_cadastre_rv
        paper2_rv = papers[1][0] if len(papers) > 1 else national_cadastre_rv
        paper3_rv = papers[2][0] if len(papers) > 2 else national_cadastre_rv

        claims_to_seed.append({
            "id": str(uuid.uuid4()),
            "resource_version_id": str(policy_rv),
            "claim_text": "Nationwide digital cadastre modernization mandates conclusive land titling backed by sub-decimeter RTK-GPS drone photogrammetry.",
            "claim_type": "statutory_mandate",
            "source_locator": {"section": "Statutory Directives", "paragraph": 3, "page": 4},
            "extraction_method": "expert_curated",
            "created_by_id": str(admin_user_id)
        })
        claims_to_seed.append({
            "id": str(uuid.uuid4()),
            "resource_version_id": str(paper2_rv),
            "claim_text": "Formalized digital cadastral titling increased formal agricultural credit disbursement to smallholder farmers by 41.8%.",
            "claim_type": "empirical_finding",
            "source_locator": {"section": "Econometric Results", "table": "Table 4: Credit Regression", "page": 12},
            "extraction_method": "gemini-1.5-flash-extraction",
            "created_by_id": str(admin_user_id)
        })
        claims_to_seed.append({
            "id": str(uuid.uuid4()),
            "resource_version_id": str(paper1_rv),
            "claim_text": "PostGIS topological validation detected and reconciled 18.4% overlapping claims between Revenue and Forest departments.",
            "claim_type": "geospatial_finding",
            "source_locator": {"section": "Cadastral Reconciliation", "figure": "Figure 6: Boundary Discrepancies", "page": 9},
            "extraction_method": "gemini-1.5-flash-extraction",
            "created_by_id": str(admin_user_id)
        })
        claims_to_seed.append({
            "id": str(uuid.uuid4()),
            "resource_version_id": str(paper3_rv),
            "claim_text": "Decentralized cryptographic mutation logs eliminated unauthorized record alteration across all surveyed pilot districts.",
            "claim_type": "security_finding",
            "source_locator": {"section": "Cryptographic Ledger Audit", "page": 15},
            "extraction_method": "expert_curated",
            "created_by_id": str(admin_user_id)
        })

        claim_insert_query = text("""
            INSERT INTO evidence_claims (
                id, resource_version_id, claim_text, claim_type, 
                source_locator, extraction_method, created_by_id
            )
            VALUES (
                :id, :resource_version_id, :claim_text, :claim_type, 
                CAST(:source_locator AS jsonb), :extraction_method, :created_by_id
            )
            ON CONFLICT (id) DO NOTHING;
        """)

        created_claim_records = []
        for cl in claims_to_seed:
            await db.execute(claim_insert_query, {
                "id": cl["id"],
                "resource_version_id": cl["resource_version_id"],
                "claim_text": cl["claim_text"],
                "claim_type": cl["claim_type"],
                "source_locator": json.dumps(cl["source_locator"]),
                "extraction_method": cl["extraction_method"],
                "created_by_id": cl["created_by_id"]
            })
            created_claim_records.append(cl)
        await db.commit()
        print(f"Successfully seeded {len(created_claim_records)} claims into evidence_claims!")

        # -------------------------------------------------------------
        # E. POPULATE evidence_links
        # -------------------------------------------------------------
        print("\n--- Seeding evidence_links ---")
        links_to_seed = []
        # Link Claim 1 (policy mandate) to Paper 1 (Western Ghats study supporting it)
        links_to_seed.append({
            "claim_id": created_claim_records[0]["id"],
            "evidence_version_id": str(paper1_rv),
            "relationship": "supports",
            "confidence": Decimal("0.960"),
            "evidence_locator": {"section": "Conclusion", "paragraph": 2},
            "notes": "Field survey verifies that sub-decimeter RTK drone mapping conclusively settles boundary demarcation.",
            "created_by_id": str(admin_user_id)
        })
        # Link Claim 2 (credit increase) to National Cadastre Dataset (dataset supporting it)
        links_to_seed.append({
            "claim_id": created_claim_records[1]["id"],
            "evidence_version_id": str(national_cadastre_rv),
            "relationship": "supports",
            "confidence": Decimal("0.925"),
            "evidence_locator": {"attribute": "credit_linkage_index", "coverage": "100%"},
            "notes": "Credit bureau parcel linkage validates statistically significant credit growth.",
            "created_by_id": str(admin_user_id)
        })
        # Link Claim 3 (geospatial reconciliation) to Policy Directive (contextualizes it)
        links_to_seed.append({
            "claim_id": created_claim_records[2]["id"],
            "evidence_version_id": str(policy_rv),
            "relationship": "contextualizes",
            "confidence": Decimal("0.890"),
            "evidence_locator": {"section": "Inter-Agency Boundary Harmonization"},
            "notes": "Policy framework establishes statutory committee to enforce PostGIS topological reconciliation.",
            "created_by_id": str(admin_user_id)
        })

        link_insert_query = text("""
            INSERT INTO evidence_links (
                id, claim_id, evidence_version_id, relationship, 
                confidence, evidence_locator, notes, created_by_id
            )
            VALUES (
                :id, :claim_id, :evidence_version_id, 
                CAST(:relationship AS evidence_relation), :confidence, 
                CAST(:evidence_locator AS jsonb), :notes, :created_by_id
            )
            ON CONFLICT (claim_id, evidence_version_id, relationship) DO UPDATE 
            SET confidence = EXCLUDED.confidence,
                notes = EXCLUDED.notes;
        """)

        for lnk in links_to_seed:
            await db.execute(link_insert_query, {
                "id": str(uuid.uuid4()),
                "claim_id": lnk["claim_id"],
                "evidence_version_id": lnk["evidence_version_id"],
                "relationship": lnk["relationship"],
                "confidence": lnk["confidence"],
                "evidence_locator": json.dumps(lnk["evidence_locator"]),
                "notes": lnk["notes"],
                "created_by_id": lnk["created_by_id"]
            })
        await db.commit()
        print(f"Successfully seeded {len(links_to_seed)} evidence links into evidence_links!")

        print("\n==============================================")
        print("ALL 5 EMPTY TABLES POPULATED SUCCESSFULLY!")
        print("==============================================")

if __name__ == "__main__":
    asyncio.run(seed_empty_tables())
