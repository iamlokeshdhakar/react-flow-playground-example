import { KnowledgeNode, KnowledgeEdge } from "./types";

export const KNOWLEDGE_NODES: KnowledgeNode[] = [
  // Taxa
  { id: "tax-1", type: "Taxon", label: "Xanthoria testflora", description: "Foliose lichen species used as the primary model organism for this research program's desiccation and UV-resilience studies." },
  { id: "tax-2", type: "Taxon", label: "Xanthoria parietina", description: "Closely related sister species used as a comparative baseline for genomic and physiological studies." },
  { id: "tax-3", type: "Taxon", label: "Teloschistales", description: "Order of lichenized fungi containing Xanthoria and several related genera studied for stress tolerance." },
  { id: "tax-4", type: "Taxon", label: "Lecanoromycetes", description: "Class of lichen-forming fungi encompassing Teloschistales and other orders relevant to phylogenetic comparison." },
  { id: "tax-5", type: "Taxon", label: "Trebouxia sp. TX4", description: "Photosynthetic algal partner isolated from X. testflora thalli, forming the lichen's symbiotic relationship." },
  { id: "tax-6", type: "Taxon", label: "Rhizocarpon geographicum", description: "Distantly related crustose lichen included as an outgroup for phylogenomic comparison." },

  // Genes
  { id: "gene-1", type: "Gene", label: "PKS9", description: "Polyketide synthase gene implicated in pigment and secondary metabolite production." },
  { id: "gene-2", type: "Gene", label: "MEL2", description: "Regulator of melanin biosynthesis, hypothesized to contribute to UV shielding." },
  { id: "gene-3", type: "Gene", label: "DES1", description: "Desiccation-tolerance gene encoding a dehydrin-family protein central to the lab's stress-response research." },
  { id: "gene-4", type: "Gene", label: "SOD3", description: "Superoxide dismutase gene involved in antioxidant defense during rehydration stress." },
  { id: "gene-5", type: "Gene", label: "PHR1", description: "Photolyase gene responsible for repairing UV-induced DNA damage." },
  { id: "gene-6", type: "Gene", label: "AQP7", description: "Aquaporin gene mediating water transport across cell membranes under variable hydration." },
  { id: "gene-7", type: "Gene", label: "HSP70L", description: "Heat shock protein gene induced during combined heat and desiccation stress." },

  // Proteins
  { id: "prot-1", type: "Protein", label: "PKS9 synthase", description: "Enzyme encoded by PKS9 catalyzing polyketide pigment synthesis." },
  { id: "prot-2", type: "Protein", label: "DES1 dehydrin", description: "Stress-protective protein that accumulates rapidly during desiccation." },
  { id: "prot-3", type: "Protein", label: "SOD3 enzyme", description: "Antioxidant enzyme that scavenges reactive oxygen species during rehydration." },
  { id: "prot-4", type: "Protein", label: "PHR1 photolyase", description: "DNA repair enzyme activated by blue light to reverse UV-induced lesions." },
  { id: "prot-5", type: "Protein", label: "AQP7 channel", description: "Membrane channel protein regulating rapid water flux during hydration cycles." },

  // Experiments
  { id: "exp-1", type: "Experiment", label: "Desiccation Tolerance Assay 2023", description: "Controlled dehydration-rehydration cycling of thalli to measure stress gene expression." },
  { id: "exp-2", type: "Experiment", label: "UV-B Exposure Trial", description: "Chamber-based UV-B irradiation of specimens to assess photodamage and repair response." },
  { id: "exp-3", type: "Experiment", label: "Symbiont Co-culture Experiment", description: "Paired culturing of fungal and algal partners to study symbiosis-driven stress responses." },
  { id: "exp-4", type: "Experiment", label: "Field Transplant Study — Alpine Site", description: "Reciprocal transplant of thalli between lowland and alpine sites to test acclimation." },
  { id: "exp-5", type: "Experiment", label: "Comparative Genome Sequencing Run", description: "Whole-genome sequencing run comparing X. testflora against related taxa." },
  { id: "exp-6", type: "Experiment", label: "Rehydration Proteomics Panel", description: "Time-resolved proteomic sampling across a rehydration event." },

  // Methods
  { id: "method-1", type: "Method", label: "RNA-seq Differential Expression", description: "Transcriptomic method quantifying gene expression changes across treatment conditions." },
  { id: "method-2", type: "Method", label: "Whole Genome Shotgun Sequencing", description: "Sequencing method used to assemble reference genomes from fragmented DNA reads." },
  { id: "method-3", type: "Method", label: "Quantitative Proteomics (LC-MS/MS)", description: "Mass spectrometry method for identifying and quantifying protein abundance." },
  { id: "method-4", type: "Method", label: "Controlled Environment Chamber Assay", description: "Standardized chamber protocol for applying reproducible desiccation and UV treatments." },

  // Hypotheses
  { id: "hyp-1", type: "Hypothesis", label: "Dehydrin accumulation drives desiccation tolerance", description: "Central hypothesis linking DES1 dehydrin levels to survival under water loss." },
  { id: "hyp-2", type: "Hypothesis", label: "Symbiosis modulates host oxidative stress response", description: "Hypothesis that the algal partner's presence alters antioxidant gene activity in the host fungus." },
  { id: "hyp-3", type: "Hypothesis", label: "UV resilience is conserved across Teloschistales", description: "Hypothesis that photoprotective mechanisms are shared broadly across the order, not unique to X. testflora." },

  // Findings
  { id: "find-1", type: "Finding", label: "DES1 expression spikes under desiccation stress", description: "Time-course data show DES1 transcript levels rising sharply within hours of water loss." },
  { id: "find-2", type: "Finding", label: "PHR1 activity correlates with UV tolerance", description: "Specimens with higher PHR1 activity show reduced UV-induced DNA damage." },
  { id: "find-3", type: "Finding", label: "Symbiont co-culture increases SOD3 output", description: "Co-cultured samples show elevated SOD3 enzyme activity relative to fungus-only controls." },
  { id: "find-4", type: "Finding", label: "Alpine population shows elevated AQP7 expression", description: "Field-collected alpine specimens express AQP7 at higher baseline levels than lowland specimens." },
  { id: "find-5", type: "Finding", label: "Genome-wide divergence between species is modest", description: "Comparative sequencing shows X. testflora and X. parietina share high genomic similarity despite habitat differences." },

  // Publications
  { id: "pub-1", type: "Publication", label: "Dehydrin Dynamics in Desert Lichens (2021)", description: "Foundational paper establishing dehydrin accumulation as a key desiccation-tolerance mechanism." },
  { id: "pub-2", type: "Publication", label: "Photoprotection Mechanisms in Lichenized Fungi (2020)", description: "Review of photolyase and pigment-based UV protection strategies in lichen-forming fungi." },
  { id: "pub-3", type: "Publication", label: "Symbiosis and Stress: A Review (2019)", description: "Survey of how fungal-algal symbiosis influences stress tolerance across lichen taxa." },
  { id: "pub-4", type: "Publication", label: "Comparative Genomics of Xanthoria spp. (2023)", description: "Genome-level comparison across Xanthoria species highlighting conserved stress-response loci." },
  { id: "pub-5", type: "Publication", label: "Alpine Lichen Ecophysiology (2022)", description: "Field study of physiological adaptation in lichen populations across elevation gradients." },
  { id: "pub-6", type: "Publication", label: "Water Transport in Poikilohydric Organisms (2018)", description: "Review of aquaporin-mediated water transport in organisms lacking active water regulation." },
  { id: "pub-7", type: "Publication", label: "Reassessing Teloschistales Phylogeny (2024)", description: "Phylogenomic reanalysis proposing revised relationships within the Teloschistales order." },

  // Datasets
  { id: "ds-1", type: "Dataset", label: "X. testflora Reference Genome v2", description: "Second-release assembled and annotated reference genome for the focal species." },
  { id: "ds-2", type: "Dataset", label: "Desiccation Time-Course RNA-seq", description: "Raw and processed RNA-seq reads across the desiccation-rehydration time course." },
  { id: "ds-3", type: "Dataset", label: "Alpine Transplant Field Measurements", description: "Physiological measurements collected from the alpine reciprocal transplant study." },
  { id: "ds-4", type: "Dataset", label: "Proteomics LC-MS/MS Raw Spectra", description: "Raw mass spectrometry spectra from the rehydration proteomics panel." },
  { id: "ds-5", type: "Dataset", label: "Teloschistales Phylogenomic Alignment", description: "Multi-species sequence alignment used for order-level phylogenetic analysis." },

  // Research projects (hubs)
  { id: "proj-1", type: "ResearchProject", label: "Lichen Stress Resilience Program", description: "Umbrella research program coordinating desiccation, UV, and symbiosis stress studies." },
  { id: "proj-2", type: "ResearchProject", label: "Fungal Symbiosis Genomics Initiative", description: "Program focused on genome and dataset production supporting symbiosis and comparative genomics work." },
];

export const KNOWLEDGE_EDGES: KnowledgeEdge[] = [
  // Taxonomy
  { id: "e1", source: "tax-1", target: "tax-3", type: "partOf" },
  { id: "e2", source: "tax-2", target: "tax-3", type: "partOf" },
  { id: "e3", source: "tax-3", target: "tax-4", type: "partOf" },
  { id: "e4", source: "tax-6", target: "tax-4", type: "partOf" },
  { id: "e5", source: "tax-5", target: "tax-1", type: "associatedWith" },
  { id: "e6", source: "tax-2", target: "tax-1", type: "associatedWith" },
  { id: "e7", source: "tax-5", target: "proj-2", type: "associatedWith" },
  { id: "e8", source: "tax-5", target: "hyp-2", type: "associatedWith" },
  { id: "e9", source: "tax-2", target: "find-5", type: "associatedWith" },

  // Genes associated with focal taxon
  { id: "e10", source: "gene-1", target: "tax-1", type: "associatedWith" },
  { id: "e11", source: "gene-2", target: "tax-1", type: "associatedWith" },
  { id: "e12", source: "gene-3", target: "tax-1", type: "associatedWith" },
  { id: "e13", source: "gene-4", target: "tax-1", type: "associatedWith" },
  { id: "e14", source: "gene-5", target: "tax-1", type: "associatedWith" },
  { id: "e15", source: "gene-6", target: "tax-1", type: "associatedWith" },
  { id: "e16", source: "gene-7", target: "tax-1", type: "associatedWith" },

  // Genes produce proteins
  { id: "e17", source: "gene-1", target: "prot-1", type: "produces" },
  { id: "e18", source: "gene-3", target: "prot-2", type: "produces" },
  { id: "e19", source: "gene-4", target: "prot-3", type: "produces" },
  { id: "e20", source: "gene-5", target: "prot-4", type: "produces" },
  { id: "e21", source: "gene-6", target: "prot-5", type: "produces" },

  // DES1 (gene-3) hub edges
  { id: "e22", source: "gene-3", target: "exp-1", type: "associatedWith" },
  { id: "e23", source: "gene-3", target: "exp-6", type: "associatedWith" },
  { id: "e24", source: "gene-3", target: "hyp-1", type: "associatedWith" },
  { id: "e25", source: "gene-3", target: "find-1", type: "associatedWith" },
  { id: "e26", source: "gene-3", target: "proj-1", type: "associatedWith" },
  { id: "e27", source: "gene-3", target: "pub-1", type: "associatedWith" },

  // Experiments associated with focal taxon
  { id: "e28", source: "exp-1", target: "tax-1", type: "associatedWith" },
  { id: "e29", source: "exp-2", target: "tax-1", type: "associatedWith" },
  { id: "e30", source: "exp-3", target: "tax-1", type: "associatedWith" },
  { id: "e31", source: "exp-4", target: "tax-1", type: "associatedWith" },
  { id: "e32", source: "exp-5", target: "tax-1", type: "associatedWith" },
  { id: "e33", source: "exp-6", target: "tax-1", type: "associatedWith" },

  { id: "e34", source: "ds-1", target: "tax-1", type: "derivedFrom" },
  { id: "e35", source: "proj-1", target: "tax-1", type: "associatedWith" },

  // Experiments use methods (sparse cluster)
  { id: "e36", source: "exp-1", target: "method-1", type: "usesMethod" },
  { id: "e37", source: "exp-1", target: "method-4", type: "usesMethod" },
  { id: "e38", source: "exp-2", target: "method-4", type: "usesMethod" },
  { id: "e39", source: "exp-3", target: "method-4", type: "usesMethod" },
  { id: "e40", source: "exp-4", target: "method-1", type: "usesMethod" },
  { id: "e41", source: "exp-5", target: "method-2", type: "usesMethod" },
  { id: "e42", source: "exp-6", target: "method-3", type: "usesMethod" },

  // Experiments derived from hypotheses + cycle closure (exp-1 -> find-1 -> hyp-1 -> exp-1)
  { id: "e43", source: "exp-1", target: "hyp-1", type: "derivedFrom" },
  { id: "e44", source: "exp-2", target: "hyp-3", type: "derivedFrom" },
  { id: "e45", source: "exp-3", target: "hyp-2", type: "derivedFrom" },
  { id: "e46", source: "hyp-1", target: "exp-1", type: "associatedWith" },

  // Experiments produce findings
  { id: "e47", source: "exp-1", target: "find-1", type: "produces" },
  { id: "e48", source: "find-1", target: "hyp-1", type: "supports" },
  { id: "e49", source: "exp-2", target: "find-2", type: "produces" },
  { id: "e50", source: "exp-3", target: "find-3", type: "produces" },
  { id: "e51", source: "exp-4", target: "find-4", type: "produces" },
  { id: "e52", source: "exp-5", target: "find-5", type: "produces" },
  { id: "e53", source: "exp-6", target: "find-3", type: "produces" },

  // Findings support/contradict hypotheses
  { id: "e54", source: "find-2", target: "hyp-3", type: "supports" },
  { id: "e55", source: "find-3", target: "hyp-2", type: "supports" },
  { id: "e56", source: "find-4", target: "hyp-1", type: "supports" },
  { id: "e57", source: "find-5", target: "hyp-3", type: "supports" },

  // Experiments produce datasets
  { id: "e58", source: "exp-5", target: "ds-1", type: "produces" },
  { id: "e59", source: "exp-1", target: "ds-2", type: "produces" },
  { id: "e60", source: "exp-4", target: "ds-3", type: "produces" },
  { id: "e61", source: "exp-6", target: "ds-4", type: "produces" },
  { id: "e62", source: "exp-5", target: "ds-5", type: "produces" },

  // Long-distance cross-branch links from ds-5
  { id: "e63", source: "ds-5", target: "tax-6", type: "associatedWith" },
  { id: "e64", source: "ds-5", target: "tax-4", type: "associatedWith" },
  { id: "e65", source: "ds-5", target: "pub-7", type: "associatedWith" },

  // Publication citation cycle + hub (pub-1)
  { id: "e66", source: "pub-1", target: "pub-2", type: "cites" },
  { id: "e67", source: "pub-2", target: "pub-3", type: "cites" },
  { id: "e68", source: "pub-3", target: "pub-1", type: "cites" },
  { id: "e69", source: "pub-4", target: "pub-1", type: "cites" },
  { id: "e70", source: "pub-5", target: "pub-1", type: "cites" },
  { id: "e71", source: "pub-6", target: "pub-1", type: "cites" },
  { id: "e72", source: "pub-7", target: "pub-1", type: "cites" },

  // Publications derived from findings
  { id: "e73", source: "pub-1", target: "find-1", type: "derivedFrom" },
  { id: "e74", source: "pub-2", target: "find-2", type: "derivedFrom" },
  { id: "e75", source: "pub-3", target: "find-3", type: "derivedFrom" },
  { id: "e76", source: "pub-4", target: "find-5", type: "derivedFrom" },
  { id: "e77", source: "pub-5", target: "find-4", type: "derivedFrom" },

  // Long-distance cross-branch links from publications
  { id: "e78", source: "pub-6", target: "gene-6", type: "associatedWith" },
  { id: "e79", source: "pub-7", target: "tax-3", type: "associatedWith" },
  { id: "e80", source: "pub-7", target: "tax-4", type: "associatedWith" },

  // Research project hubs
  { id: "e81", source: "proj-1", target: "hyp-1", type: "associatedWith" },
  { id: "e82", source: "proj-1", target: "hyp-2", type: "associatedWith" },
  { id: "e83", source: "proj-1", target: "hyp-3", type: "associatedWith" },
  { id: "e84", source: "proj-1", target: "exp-1", type: "associatedWith" },
  { id: "e85", source: "proj-1", target: "exp-2", type: "associatedWith" },
  { id: "e86", source: "proj-1", target: "exp-3", type: "associatedWith" },
  { id: "e87", source: "proj-1", target: "exp-4", type: "associatedWith" },
  { id: "e88", source: "proj-2", target: "ds-1", type: "associatedWith" },
  { id: "e89", source: "proj-2", target: "ds-2", type: "associatedWith" },
  { id: "e90", source: "proj-2", target: "ds-4", type: "associatedWith" },
  { id: "e91", source: "proj-2", target: "ds-5", type: "associatedWith" },
  { id: "e92", source: "proj-2", target: "exp-5", type: "associatedWith" },
  { id: "e93", source: "proj-2", target: "exp-6", type: "associatedWith" },
  { id: "e94", source: "proj-2", target: "pub-4", type: "associatedWith" },
];
