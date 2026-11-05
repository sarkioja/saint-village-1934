// GENERATED por tools/transpile-template.mjs — NAO EDITAR A MAO.
// Regenere com `npm run gen`. A fonte e' source/template.html.
//
// Os estilos inline vem do template original com os valores preservados; nenhuma
// normalizacao de CSS e' feita. Textos sao strings literais para que o JSX nao
// altere espacos em branco.
import React, { Fragment } from 'react';
import './hover.css';

export default function OracleView({ v }: { v: any }) {
  return (
    <>{"\n"}{"\n\n"}
    <div style={{minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%,var(--sv-bg1,#1d1a16) 0%,var(--sv-bg,#0b0a09) 60%,var(--sv-bg2,#050504) 100%)", fontFamily: "'Oswald',sans-serif", position: "relative", overflowX: "hidden"}}>{"\n\n"}
      {v.loading ? (<>{"\n  "}
        <div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Special Elite',monospace", color: "#9b9488", fontSize: "16px"}}>{"Abrindo os arquivos da cidade"}
          <span style={{animation: "svblink 1s infinite"}}>{"▌"}</span></div>{"\n"}</>) : null}{"\n\n"}
      {v.noEra ? (<>{"\n  "}
        <div style={{minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: "#070707"}}>{"\n    "}
          <div style={{position: "absolute", inset: "0", background: "url(\"/assets/city.png\") center 30%/cover no-repeat", filter: "grayscale(1) contrast(1.05)", opacity: "0.6", pointerEvents: "none"}} />{"\n    "}
          <div style={{position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(7,7,7,0.55) 0%,rgba(7,7,7,0.35) 30%,rgba(7,7,7,0.75) 62%,rgba(7,7,7,0.95) 100%)", pointerEvents: "none"}} />{"\n    "}
          <div style={{position: "absolute", inset: "0", background: "radial-gradient(ellipse at 50% 28%,transparent 0%,rgba(0,0,0,0.7) 78%)", pointerEvents: "none"}} />{"\n    "}
          <div style={{position: "relative", padding: "clamp(64px,11vh,128px) 24px 36px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center"}}>{"\n      "}
            <div style={{fontSize: "12px", letterSpacing: "0.55em", paddingLeft: "0.55em", color: "#d6d1c6", textTransform: "uppercase", marginBottom: "30px", whiteSpace: "nowrap"}}>{"Narrador de crônicas solo"}</div>{"\n      "}
            <div role={"img"} aria-label={"Saint Village XX Century"} style={{display: "flex", flexDirection: "column", alignItems: "center", lineHeight: "1", textTransform: "uppercase"}}>{"\n        "}
              <div style={{fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(68px,13vw,156px)", lineHeight: "0.86", letterSpacing: "0.015em", color: "#f7f5f0", whiteSpace: "nowrap"}}>{"Saint Village"}</div>{"\n        "}
              <div style={{fontFamily: "'Poiret One',sans-serif", fontSize: "clamp(28px,5.4vw,64px)", lineHeight: "1", letterSpacing: "0.14em", color: "#d6d1c6", marginTop: "clamp(4px,0.8vw,10px)", paddingLeft: "0.14em", whiteSpace: "nowrap"}}>{"XX Century"}</div>{"\n      "}</div>{"\n      "}
            <div style={{width: "96px", height: "1px", background: "#d6d1c6", marginTop: "36px"}} />{"\n      "}
            <div style={{fontFamily: "'Special Elite',monospace", fontSize: "15px", color: "#a8a399", maxWidth: "540px", lineHeight: "1.65", marginTop: "26px", textWrap: "pretty"}}>{"Uma metrópole portuária da Costa Oeste. A mesma cidade ao longo de um século: cinco eras, um dado de seis faces e a sua consciência."}</div>{"\n    "}</div>{"\n    "}
          <div style={{position: "relative", flex: "1", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,215px),1fr))", gap: "2px", padding: "24px", maxWidth: "1320px", width: "100%", margin: "0 auto", alignContent: "center"}}>{"\n      "}
            <button type={"button"} onClick={v.pick1934} style={{font: "inherit", textAlign: "left", cursor: "pointer", background: "rgba(14,13,12,0.92)", color: "#f2efe8", border: "1px solid #2a2622", borderTop: "2px solid #d9d4c7", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "12px", transition: "transform .25s,border-color .25s"}} className="svh-0">{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap"}}>
                <span style={{color: "#d6d1c6"}}>{"Noir"}</span>
                <span style={{border: "1.5px solid #b0281f", color: "#c8372b", padding: "2px 7px", fontWeight: "600", transform: "rotate(-3deg)", letterSpacing: "0.2em"}}>{"Confidencial"}</span></div>{"\n        "}
              <div style={{fontFamily: "'Poiret One',sans-serif", fontSize: "84px", lineHeight: "0.95", letterSpacing: "0.04em", color: "#d6d1c6"}}>{"1934"}</div>{"\n        "}
              <div style={{fontFamily: "'Bebas Neue',sans-serif", fontSize: "26px", letterSpacing: "0.06em", lineHeight: "1"}}>{"Lei Seca"}</div>{"\n        "}
              <div style={{fontFamily: "'Special Elite',monospace", fontSize: "14px", lineHeight: "1.6", color: "#cfcac0", textWrap: "pretty"}}>{"Fim da Lei Seca, fundo da Depressão. Uma ponte em construção, uma ilha-prisão e um porto onde tudo entra sem nota fiscal. Cada bairro tem um dono; cada dono tem um tira; cada tira tem um segredo."}</div>{"\n        "}
              <div style={{marginTop: "auto", alignSelf: "flex-start", fontSize: "12px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f2efe8", border: "1px solid #d6d1c6", padding: "9px 14px"}}>{"Abrir o dossiê →"}</div>{"\n      "}</button>{"\n      "}
            <button type={"button"} onClick={v.pick1946} style={{font: "inherit", textAlign: "left", cursor: "pointer", background: "rgba(14,13,12,0.92)", color: "#f2efe8", border: "1px solid #2a2622", borderTop: "2px solid #9a2a1e", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "12px", transition: "transform .25s,border-color .25s"}} className="svh-1">{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap"}}>
                <span style={{color: "#d6d1c6"}}>{"Noir"}</span>
                <span style={{border: "1.5px solid #b0281f", color: "#c8372b", padding: "2px 7px", fontWeight: "600", transform: "rotate(-3deg)", letterSpacing: "0.2em"}}>{"Confidencial"}</span></div>{"\n        "}
              <div style={{fontFamily: "'Poiret One',sans-serif", fontSize: "84px", lineHeight: "0.95", letterSpacing: "0.04em", color: "#d6d1c6"}}>{"1946"}</div>{"\n        "}
              <div style={{fontFamily: "'Bebas Neue',sans-serif", fontSize: "26px", letterSpacing: "0.06em", lineHeight: "1"}}>{"Pós-guerra"}</div>{"\n        "}
              <div style={{fontFamily: "'Special Elite',monospace", fontSize: "14px", lineHeight: "1.6", color: "#cfcac0", textWrap: "pretty"}}>{"Os navios de tropa entram pelo estreito, um por semana. O estaleiro demite mil por mês e a Comissão anota nomes no terceiro andar do Fórum. O que você trouxe da guerra, e quem vai cobrar?"}</div>{"\n        "}
              <div style={{marginTop: "auto", alignSelf: "flex-start", fontSize: "12px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f2efe8", border: "1px solid #d6d1c6", padding: "9px 14px"}}>{"Voltar para casa →"}</div>{"\n      "}</button>{"\n      "}
            <button type={"button"} onClick={v.pick1974} style={{font: "inherit", textAlign: "left", cursor: "pointer", background: "rgba(14,13,12,0.92)", color: "#f2efe8", border: "1px solid #2a2622", borderTop: "2px solid #8a8680", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "12px", transition: "transform .25s,border-color .25s"}} className="svh-2">{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap"}}>
                <span style={{color: "#d6d1c6"}}>{"Neo-noir"}</span>
                <span style={{border: "1.5px solid #b0281f", color: "#c8372b", padding: "2px 7px", fontWeight: "600", transform: "rotate(-3deg)", letterSpacing: "0.2em"}}>{"Confidencial"}</span></div>{"\n        "}
              <div style={{fontFamily: "'Poiret One',sans-serif", fontSize: "84px", lineHeight: "0.95", letterSpacing: "0.04em", color: "#d6d1c6"}}>{"1974"}</div>{"\n        "}
              <div style={{fontFamily: "'Bebas Neue',sans-serif", fontSize: "26px", letterSpacing: "0.06em", lineHeight: "1"}}>{"Conspiração"}</div>{"\n        "}
              <div style={{fontFamily: "'Courier Prime',monospace", fontSize: "14px", lineHeight: "1.6", color: "#cfcac0", textWrap: "pretty"}}>{"O telefone faz um clique a mais antes de dar linha. Fitas de rolo, um viaduto sobre o porto, oito torres novas e um homem de gravata fina na sala 7. Quem está ouvindo, e o que ele já sabe?"}</div>{"\n        "}
              <div style={{marginTop: "auto", alignSelf: "flex-start", fontSize: "12px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f2efe8", border: "1px solid #d6d1c6", padding: "9px 14px"}}>{"Ir para o mural →"}</div>{"\n      "}</button>{"\n      "}
            <button type={"button"} onClick={v.pick1994} style={{font: "inherit", textAlign: "left", cursor: "pointer", background: "rgba(14,13,12,0.92)", color: "#f2efe8", border: "1px solid #2a2622", borderTop: "2px solid #e0242b", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "12px", transition: "transform .25s,border-color .25s"}} className="svh-3">{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap"}}>
                <span style={{color: "#d6d1c6"}}>{"Neo-noir"}</span>
                <span style={{border: "1.5px solid #b0281f", color: "#c8372b", padding: "2px 7px", fontWeight: "600", transform: "rotate(-3deg)", letterSpacing: "0.2em"}}>{"Confidencial"}</span></div>{"\n        "}
              <div style={{fontFamily: "'Poiret One',sans-serif", fontSize: "84px", lineHeight: "0.95", letterSpacing: "0.04em", color: "#d6d1c6"}}>{"1994"}</div>{"\n        "}
              <div style={{fontFamily: "'Bebas Neue',sans-serif", fontSize: "26px", letterSpacing: "0.06em", lineHeight: "1"}}>{"Néon e pó"}</div>{"\n        "}
              <div style={{fontFamily: "'Courier Prime',monospace", fontSize: "14px", lineHeight: "1.6", color: "#cfcac0", textWrap: "pretty"}}>{"O rum virou cocaína, o jornal virou televisão, a ilha-prisão virou cassino. A pergunta não é se você vai descobrir a verdade; é quem ainda vai estar de pé quando descobrir."}</div>{"\n        "}
              <div style={{marginTop: "auto", alignSelf: "flex-start", fontSize: "12px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f2efe8", border: "1px solid #d6d1c6", padding: "9px 14px"}}>{"Entrar no táxi →"}</div>{"\n      "}</button>{"\n      "}
            <button type={"button"} onClick={v.pick1999} style={{font: "inherit", textAlign: "left", cursor: "pointer", background: "rgba(14,13,12,0.92)", color: "#f2efe8", border: "1px solid #2a2622", borderTop: "2px solid #7d8a94", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "12px", transition: "transform .25s,border-color .25s"}} className="svh-4">{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap"}}>
                <span style={{color: "#d6d1c6"}}>{"Neo-noir"}</span>
                <span style={{border: "1.5px solid #b0281f", color: "#c8372b", padding: "2px 7px", fontWeight: "600", transform: "rotate(-3deg)", letterSpacing: "0.2em"}}>{"Confidencial"}</span></div>{"\n        "}
              <div style={{fontFamily: "'Poiret One',sans-serif", fontSize: "84px", lineHeight: "0.95", letterSpacing: "0.04em", color: "#d6d1c6"}}>{"1999"}</div>{"\n        "}
              <div style={{fontFamily: "'Bebas Neue',sans-serif", fontSize: "26px", letterSpacing: "0.06em", lineHeight: "1"}}>{"Epílogo do século"}</div>{"\n        "}
              <div style={{fontFamily: "'Courier Prime',monospace", fontSize: "14px", lineHeight: "1.6", color: "#cfcac0", textWrap: "pretty"}}>{"Três e vinte da manhã de 26 de dezembro. O táxi mais velho da cidade em fila dupla na porta do Palermo, um velho morto ao volante, um envelope lacrado no banco. Seis dias até o ano 2000."}</div>{"\n        "}
              <div style={{marginTop: "auto", alignSelf: "flex-start", fontSize: "12px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#f2efe8", border: "1px solid #d6d1c6", padding: "9px 14px"}}>{"Abrir o envelope →"}</div>{"\n      "}</button>{"\n    "}</div>{"\n    "}
          <div style={{position: "relative", textAlign: "center", padding: "20px", fontSize: "12px", letterSpacing: "0.3em", color: "#77726a", textTransform: "uppercase"}}>{"Baseado em Saint Village XX Century, de Felipe Malorgio · GUMSHOE SRD (CC-BY 3.0)"}</div>{"\n  "}</div>{"\n"}</>) : null}{"\n\n"}
      {v.hasEra ? (<>{"\n  "}
        <div aria-hidden={"true"} style={{position: "fixed", inset: "0", zIndex: "0", pointerEvents: "none", background: "#070707"}}>{"\n    "}
          <div style={{position: "absolute", inset: "0", background: `url('${v.tabBg}') center 30%/cover no-repeat`, filter: "grayscale(1) contrast(1.05)", opacity: "0.42", transition: "background-image .4s"}} />{"\n    "}
          <div style={{position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(7,7,7,0.55) 0%,rgba(7,7,7,0.35) 30%,rgba(7,7,7,0.75) 62%,rgba(7,7,7,0.95) 100%)"}} />{"\n    "}
          <div style={{position: "absolute", inset: "0", background: "radial-gradient(ellipse at 50% 28%,transparent 0%,rgba(0,0,0,0.7) 78%)"}} />{"\n  "}</div>{"\n  "}
        <div style={{position: "sticky", top: "0", zIndex: "5", background: "var(--sv-bg,#0b0a09)"}}>{"\n    "}
          <div style={{maxWidth: "1180px", margin: "0 auto", padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px 24px", flexWrap: "wrap"}}>{"\n      "}
            <div style={{display: "flex", alignItems: "baseline", gap: "12px 18px", flexWrap: "wrap"}}>{"\n        "}
              <div role={"img"} aria-label={"Saint Village"} style={{fontFamily: "'Bebas Neue',sans-serif", fontSize: "40px", lineHeight: "1", letterSpacing: "0.02em", textTransform: "uppercase", color: "var(--sv-ink,#f2efe8)", whiteSpace: "nowrap"}}>{"Saint Village"}</div>{"\n        "}
              <div style={{fontFamily: "'Poiret One',sans-serif", fontSize: "34px", letterSpacing: "0.06em", color: "var(--sv-accent2,#d6d1c6)", lineHeight: "1"}}>{v.era}</div>{"\n        "}
              <div style={{border: "2px solid var(--sv-accent,#b0281f)", color: "var(--sv-accent2,#c8372b)", padding: "4px 10px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", lineHeight: "1.4", fontWeight: "600", transform: "rotate(-2deg)", alignSelf: "center", whiteSpace: "nowrap"}}>{v.eraSub}</div>{"\n      "}</div>{"\n      "}
            <div style={{display: "flex", alignItems: "center", gap: "12px 32px", flexWrap: "wrap"}}>{"\n        "}
              <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", color: "var(--sv-dim,#9b9488)", whiteSpace: "nowrap"}}>{"Arquivo nº SV-"}{v.era}{" · "}
                <span style={{textTransform: "uppercase", letterSpacing: "0.15em"}}>{"Confidencial"}</span></div>{"\n        "}
              <button onClick={v.changeEra} style={{flex: "none", background: "none", border: "1px solid var(--sv-ink,#ebe5d6)", color: "var(--sv-ink,#ebe5d6)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer"}} className="svh-5">{"Trocar era"}</button>{"\n      "}</div>{"\n    "}</div>{"\n    "}
          <div style={{maxWidth: "1180px", margin: "0 auto", padding: "16px 20px 0", display: "flex", gap: "4px", overflowX: "auto", alignItems: "flex-end"}} role={"tablist"} aria-label={"Seções"}>{"\n      "}
            {(v.tabs ?? []).map((t: any, t__i: number) => (<Fragment key={t__i}>{"\n        "}
              {t.active ? (<>
                <button role={"tab"} aria-selected={"true"} onClick={t.go} style={{flex: "none", display: "flex", alignItems: "baseline", gap: "8px", background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "12px 22px 10px 16px", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", fontWeight: "600", clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 100%,0 100%)"}}>{t.label}</button></>) : null}{"\n        "}
              {t.inactive ? (<>
                <button role={"tab"} aria-selected={"false"} onClick={t.go} style={{flex: "none", display: "flex", alignItems: "baseline", gap: "8px", background: "var(--sv-panel2,#16140f)", color: "var(--sv-dim,#9b9488)", border: "none", padding: "9px 22px 8px 16px", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", clipPath: "polygon(0 0,calc(100% - 12px) 0,100% 100%,0 100%)"}} className="svh-6">{t.label}</button></>) : null}{"\n      "}</Fragment>))}{"\n    "}</div>{"\n    "}
          <div style={{height: "1px", background: "var(--sv-paper,#e9e3d3)", opacity: "0.35"}} />{"\n  "}</div>{"\n\n  "}
        <div style={{position: "relative", zIndex: "1", maxWidth: "1180px", margin: "0 auto", padding: "40px 20px 80px"}}>{"\n\n    "}
          {v.tabCronica ? (<>{"\n      "}
            <div style={{display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "flex-start"}}>{"\n        "}
              <div style={{flex: "999 1 560px", minWidth: "0", display: "flex", flexDirection: "column", gap: "16px"}}>{"\n          "}
                <div ref={v.logRef} style={{background: "var(--sv-panel2,#11100e)", border: "1px solid var(--sv-line,#2b2824)", minHeight: "420px", maxHeight: v.logMaxH, overflowY: v.logOverflow, padding: "28px clamp(16px,4vw,40px)", display: "flex", flexDirection: "column", gap: "24px"}}>{"\n            "}
                  {v.logEmpty ? (<>{"\n              "}
                    <div style={{margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "0"}}>{"\n                "}
                      {v.is1934 ? (<>{"\n                  "}
                        <div aria-label={v.emptyLine} style={{position: "relative", width: "100%", maxWidth: "660px", padding: "20px 24px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "linear-gradient(118deg,transparent 0 38%,rgba(255,255,255,0.045) 38% 45%,transparent 45% 56%,rgba(255,255,255,0.045) 56% 60%,transparent 60%),radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.09),transparent 65%)"}}>{"\n                    "}
                          <div style={{fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "16px", letterSpacing: "0.06em", color: "#cfc9bc"}}>{v.abKicker}</div>{"\n                    "}
                          <div style={{fontFamily: "'Limelight',serif", fontSize: "clamp(40px,7.5vw,72px)", lineHeight: "0.95", color: "#f4f1ea", textTransform: "uppercase", letterSpacing: "0.01em", textShadow: "2px 2px 0 #55514a,4px 4px 0 #3a3631,6px 6px 0 #1e1c19,10px 12px 18px rgba(0,0,0,0.8)", transform: "rotate(-3deg)", textWrap: "balance"}}>{v.abTitulo}</div>{"\n                    "}
                          {v.abHasSub ? (<>
                            <div style={{fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: "700", fontSize: "clamp(20px,3.4vw,30px)", color: "#d6d1c6", transform: "rotate(-3deg)"}}>{v.abSub}</div></>) : null}{"\n                    "}
                          <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", lineHeight: "1.6", color: "#a8a399", maxWidth: "440px", marginTop: "16px", textWrap: "balance"}}>{v.abLinha}</div>{"\n                    "}
                          <div style={{fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6f6a61", marginTop: "14px"}}>{v.abCopy}</div>{"\n                  "}</div>{"\n                "}</>) : null}{"\n                "}
                      {v.is1946 ? (<>{"\n                  "}
                        <div aria-label={v.emptyLine} style={{position: "relative", width: "100%", maxWidth: "660px", padding: "20px 24px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", background: "radial-gradient(ellipse at 50% 40%,rgba(255,255,255,0.07),transparent 70%)"}}>{"\n                    "}
                          <div style={{fontFamily: "'Oswald',sans-serif", fontWeight: "600", fontSize: "13px", letterSpacing: "0.32em", textTransform: "uppercase", color: "#d6d1c6"}}>{"Saint Village Pictures Corporation"}</div>{"\n                    "}
                          <div style={{fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "14px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a8a399"}}>{v.abKicker}</div>{"\n                    "}
                          <div style={{height: "1px", width: "120px", background: "#55514a", margin: "10px 0 6px"}} />{"\n                    "}
                          <div style={{fontFamily: "'Playfair Display',serif", fontWeight: "400", fontSize: "clamp(38px,7vw,66px)", lineHeight: "1", color: "#eeeae2", textTransform: "uppercase", letterSpacing: "0.03em", transform: "scaleY(1.28)", transformOrigin: "center", margin: "14px 0", textShadow: "0 0 24px rgba(255,255,255,0.15)", textWrap: "balance"}}>{v.abTitulo}</div>{"\n                    "}
                          <div style={{fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "17px", lineHeight: "1.5", color: "#cfc9bc", maxWidth: "460px", marginTop: "8px", textWrap: "balance"}}>{"“"}{v.abLinha}{"”"}</div>{"\n                    "}
                          <div style={{fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6f6a61", marginTop: "16px"}}>{v.abCopy}</div>{"\n                  "}</div>{"\n                "}</>) : null}{"\n                "}
                      {v.is1974 ? (<>{"\n                  "}
                        <div aria-label={v.emptyLine} style={{position: "relative", width: "100%", maxWidth: "660px", padding: "20px 24px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", background: "repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0 2px,transparent 2px 5px)"}}>{"\n                    "}
                          <div style={{display: "flex", gap: "20px", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#a8a399"}}>
                            <span>{"Direção: o Diretor"}</span>
                            <span>{"Uma produção Saint Village"}</span></div>{"\n                    "}
                          <div style={{fontFamily: "'Anton',sans-serif", fontStyle: "italic", fontSize: "clamp(46px,8.5vw,84px)", lineHeight: "0.92", color: "#ece8de", textTransform: "uppercase", letterSpacing: "0.01em", transform: "skewX(-9deg) rotate(-2deg)", textShadow: "1px 1px 0 #8f8a80,2px 2px 0 #77726a,3px 3px 0 #5f5a53,4px 4px 0 #48443e,5px 5px 0 #33302c,6px 6px 0 #22201d,8px 10px 16px rgba(0,0,0,0.85)", textWrap: "balance"}}>{v.abTitulo}</div>{"\n                    "}
                          <div style={{fontFamily: "'Oswald',sans-serif", fontSize: "14px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#d6d1c6", marginTop: "10px"}}>{"(  "}{v.abLinha}{"  )"}</div>{"\n                    "}
                          <div style={{fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6f6a61", marginTop: "10px"}}>{v.abCopy}</div>{"\n                  "}</div>{"\n                "}</>) : null}{"\n                "}
                      {v.is1994 ? (<>{"\n                  "}
                        <div aria-label={v.emptyLine} style={{position: "relative", width: "100%", maxWidth: "660px", padding: "20px 24px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "radial-gradient(ellipse at 50% 55%,rgba(212,31,39,0.16),transparent 65%)"}}>{"\n                    "}
                          <div style={{fontFamily: "'Pinyon Script',cursive", fontSize: "30px", lineHeight: "1", color: "#e9e3d6"}}>{"Saint Village Pictures"}</div>{"\n                    "}
                          <div style={{fontFamily: "'Oswald',sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#a8a399"}}>{v.abKicker}</div>{"\n                    "}
                          <div style={{fontFamily: "'Monoton',sans-serif", fontSize: "clamp(40px,8vw,78px)", lineHeight: "1.08", color: "#ffe3df", textTransform: "uppercase", letterSpacing: "0.04em", margin: "12px 0 4px", textShadow: "0 0 4px #fff,0 0 10px #ff5a5f,0 0 22px #d41f27,0 0 44px #d41f27,0 0 70px rgba(212,31,39,0.6)", animation: "svflicker 6s infinite", textWrap: "balance"}}>{v.abTitulo}</div>{"\n                    "}
                          <div style={{fontFamily: "var(--sv-type,'Courier Prime',monospace)", fontSize: "15px", lineHeight: "1.6", color: "#cfc9bc", maxWidth: "440px", textWrap: "balance"}}>{v.abLinha}</div>{"\n                    "}
                          <div style={{fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6f6a61", marginTop: "14px"}}>{v.abCopy}</div>{"\n                  "}</div>{"\n                "}</>) : null}{"\n                "}
                      {v.is1999 ? (<>{"\n                  "}
                        <div aria-label={v.emptyLine} style={{position: "relative", width: "100%", maxWidth: "560px", padding: "20px", background: "linear-gradient(125deg,transparent 0 30%,rgba(255,255,255,0.07) 42%,transparent 62%)"}}>{"\n                    "}
                          <div style={{border: "1px solid #8f8a80", outline: "1px solid #55514a", outlineOffset: "5px", padding: "30px 24px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative"}}>{"\n                      "}
                            <div style={{fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "18px", color: "#cfc9bc", letterSpacing: "0.04em"}}>{"✦  "}{v.abKicker}{"  ✦"}</div>{"\n                      "}
                            <div style={{fontFamily: "'Pinyon Script',cursive", fontSize: "clamp(48px,9vw,84px)", lineHeight: "1.1", color: "#f4f1ea", textShadow: "0 2px 14px rgba(0,0,0,0.7)", textWrap: "balance"}}>{v.abTitulo}</div>{"\n                      "}
                            <div style={{fontFamily: "var(--sv-type,'Courier Prime',monospace)", fontSize: "15px", lineHeight: "1.6", color: "#a8a399", maxWidth: "400px", textWrap: "balance"}}>{v.abLinha}</div>{"\n                      "}
                            <div style={{fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6f6a61", marginTop: "10px"}}>{v.abCopy}</div>{"\n                    "}</div>{"\n                  "}</div>{"\n                "}</>) : null}{"\n                "}
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", color: "var(--sv-dim,#9b9488)", fontSize: "15px", maxWidth: "460px", lineHeight: "1.6"}}>{"Monte a ficha, escolha um caso na aba Caso ou deixe o narrador sortear um gancho do livro."}</div>{"\n                "}
                      <div style={{display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center"}}>{"\n                  "}
                        <button onClick={v.openCase} style={{background: "var(--sv-accent2,#d6d1c6)", color: "var(--sv-on-accent2,#0b0a09)", border: "none", padding: "14px 24px", fontSize: "14px", letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer"}} className="svh-7">{"Abrir o caso"}</button>{"\n                  "}
                        <button onClick={v.goFicha} style={{background: "none", border: "1px solid var(--sv-ink,#ebe5d6)", color: "var(--sv-ink,#ebe5d6)", padding: "14px 24px", fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer"}}>{"Montar a ficha"}</button>{"\n                "}</div>{"\n              "}</div>{"\n            "}</>) : null}{"\n            "}
                  {(v.logView ?? []).map((e: any, e__i: number) => (<Fragment key={e__i}>{"\n              "}
                    {e.isNarr ? (<>{"\n                "}
                      <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>{"\n                  "}
                        <div style={{fontSize: "12px", letterSpacing: "0.22em", color: "var(--sv-dim2,#6f6a61)", textTransform: "uppercase"}}>{e.who}</div>{"\n                  "}
                        <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "17px", lineHeight: "1.75", whiteSpace: "pre-wrap", textWrap: "pretty"}}>{e.text}</div>{"\n                  "}
                        <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>{"\n                    "}
                          {(e.acts ?? []).map((a: any, a__i: number) => (<Fragment key={a__i}>{"\n                      "}
                            <button onClick={a.go} style={{background: "none", border: "1px solid var(--sv-accent-soft,#e3a29b)", color: "var(--sv-ink,#ebe5d6)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}} className="svh-8">{a.label}</button>{"\n                    "}</Fragment>))}{"\n                  "}</div>{"\n                "}</div>{"\n              "}</>) : null}{"\n              "}
                    {e.isNpc ? (<>{"\n                "}
                      <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>{"\n                  "}
                        <div style={{fontSize: "12px", letterSpacing: "0.22em", color: "var(--sv-accent2,#c8372b)", textTransform: "uppercase"}}>{e.who}</div>{"\n                  "}
                        <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "17px", lineHeight: "1.75", whiteSpace: "pre-wrap", textWrap: "pretty"}}>{e.text}</div>{"\n                  "}
                        <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>{"\n                    "}
                          {(e.acts ?? []).map((a: any, a__i: number) => (<Fragment key={a__i}>{"\n                      "}
                            <button onClick={a.go} style={{background: "none", border: "1px solid var(--sv-accent-soft,#e3a29b)", color: "var(--sv-ink,#ebe5d6)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}} className="svh-9">{a.label}</button>{"\n                    "}</Fragment>))}{"\n                  "}</div>{"\n                "}</div>{"\n              "}</>) : null}{"\n              "}
                    {e.isPlayer ? (<>{"\n                "}
                      <div style={{display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", textAlign: "right", paddingLeft: "15%"}}>{"\n                  "}
                        <div style={{fontSize: "12px", letterSpacing: "0.22em", color: "var(--sv-dim2,#6f6a61)", textTransform: "uppercase"}}>{e.who}</div>{"\n                  "}
                        <div style={{fontFamily: "var(--sv-voice,'Bodoni Moda',serif)", fontStyle: "italic", fontSize: "19px", lineHeight: "1.5", color: "var(--sv-ink2,#d8d1c0)", textWrap: "pretty"}}>{e.text}</div>{"\n                "}</div>{"\n              "}</>) : null}{"\n              "}
                    {e.isMech ? (<>{"\n                "}
                      <div style={{alignSelf: "center", border: "1px solid var(--sv-line2,#3a3631)", padding: "10px 20px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", maxWidth: "100%", textAlign: "center"}}>{"\n                  "}
                        <div style={{display: "flex", gap: "12px", alignItems: "baseline", flexWrap: "wrap", justifyContent: "center"}}>{"\n                    "}
                          <div style={{fontSize: "12px", letterSpacing: "0.22em", color: "var(--sv-accent2,#c8372b)", textTransform: "uppercase"}}>{e.who}</div>{"\n                    "}
                          <div style={{fontSize: "15px", letterSpacing: "0.05em", color: "var(--sv-ink,#ebe5d6)"}}>{e.text}</div>{"\n                  "}</div>{"\n                  "}
                        <div style={{display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center"}}>{"\n                    "}
                          {(e.acts ?? []).map((a: any, a__i: number) => (<Fragment key={a__i}>{"\n                      "}
                            <button onClick={a.go} style={{background: "var(--sv-ink,#ebe5d6)", border: "none", color: "var(--sv-bg,#0b0a09)", padding: "8px 12px", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"}} className="svh-10">{a.label}</button>{"\n                    "}</Fragment>))}{"\n                  "}</div>{"\n                "}</div>{"\n              "}</>) : null}{"\n            "}</Fragment>))}{"\n            "}
                  {v.busy ? (<>{"\n              "}
                    <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", color: "var(--sv-dim,#9b9488)", fontSize: "15px"}}>{"O narrador datilografa"}
                      <span style={{animation: "svblink 1s infinite"}}>{"▌"}</span></div>{"\n            "}</>) : null}{"\n          "}</div>{"\n\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center"}}>{"\n              "}
                    <div style={{display: "flex", border: "1px solid var(--sv-line2,#3a3631)"}}>{"\n                "}
                      {(v.modes ?? []).map((m: any, m__i: number) => (<Fragment key={m__i}>{"\n                  "}
                        {m.active ? (<>
                          <button onClick={m.go} style={{background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{m.label}</button></>) : null}{"\n                  "}
                        {m.inactive ? (<>
                          <button onClick={m.go} style={{background: "none", color: "var(--sv-dim,#9b9488)", border: "none", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{m.label}</button></>) : null}{"\n                "}</Fragment>))}{"\n              "}</div>{"\n              "}
                    {v.modeFala ? (<>{"\n                "}
                      <select value={v.talkTo} onChange={v.onTalkTo} style={{background: "var(--sv-panel2,#11100e)", border: "1px solid var(--sv-line2,#3a3631)", padding: "8px 10px", fontSize: "13px", minWidth: "220px", maxWidth: "100%"}}>{"\n                  "}
                        <option value={""}>{"Falar em voz alta (ambiente)"}</option>{"\n                  "}
                        {(v.talkOptions ?? []).map((o: any, o__i: number) => (<Fragment key={o__i}>
                          <option value={o.id}>{o.nome}</option></Fragment>))}{"\n                "}</select>{"\n              "}</>) : null}{"\n            "}</div>{"\n            "}
                  <div style={{display: "flex", border: "1px solid var(--sv-ink,#ebe5d6)"}}>{"\n              "}
                    <textarea value={v.draft} onChange={v.onDraft} onKeyDown={v.onDraftKey} placeholder={v.draftPh} rows={2} style={{flex: "1", minWidth: "0", background: "var(--sv-bg,#0b0a09)", border: "none", outline: "none", padding: "14px 16px", fontFamily: "var(--sv-voice,'Bodoni Moda',serif)", fontStyle: "italic", fontSize: "18px", resize: "vertical", minHeight: "56px"}} />{"\n              "}
                    <button onClick={v.send} style={{background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "0 24px", fontSize: "14px", letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", fontWeight: "600"}} className="svh-11">{"Enviar"}</button>{"\n            "}</div>{"\n            "}
                  <div style={{display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center"}}>{"\n              "}
                    <button onClick={v.askContinue} style={{background: "none", border: "none", color: "var(--sv-dim,#9b9488)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", padding: "8px 0"}} className="svh-12">{"Continuar cena"}</button>{"\n              "}
                    <button onClick={v.askClue} style={{background: "none", border: "none", color: "var(--sv-dim,#9b9488)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", padding: "8px 0"}} className="svh-13">{"Pedir pista ou gancho"}</button>{"\n              "}
                    <button onClick={v.askSummary} style={{background: "none", border: "none", color: "var(--sv-dim,#9b9488)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", padding: "8px 0"}} className="svh-14">{"Resumir a crônica"}</button>{"\n              "}
                    <div style={{flex: "1"}} />{"\n              "}
                    <button onClick={v.clearLog} style={{background: "none", border: "1.5px solid var(--sv-accent,#b0281f)", color: "var(--sv-accent-soft,#e3a29b)", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", padding: "6px 10px", transform: "rotate(-1deg)"}} className="svh-15">{"Arquivar crônica"}</button>{"\n            "}</div>{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              <div style={{flex: "1 1 300px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0"}}>{"\n          "}
                <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)"}}>{"Cena atual"}</div>{"\n            "}
                  <select value={v.cena} onChange={v.onCena} style={{background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "9px 10px", fontSize: "14px"}}>{"\n              "}
                    <option value={""}>{"Sem região definida"}</option>{"\n              "}
                    {(v.regionOptions ?? []).map((o: any, o__i: number) => (<Fragment key={o__i}>
                      <option value={o.nome}>{o.nome}</option></Fragment>))}{"\n            "}</select>{"\n            "}
                  {v.hasCenaMeta ? (<>{"\n              "}
                    <div style={{fontSize: "12px", letterSpacing: "0.08em", color: "var(--sv-dim,#9b9488)", lineHeight: "1.5"}}>{v.cenaMeta}</div>{"\n            "}</>) : null}{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", marginTop: "6px"}}>{"Em cena"}</div>{"\n            "}
                  <div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>{"\n              "}
                    {(v.naCenaView ?? []).map((n: any, n__i: number) => (<Fragment key={n__i}>{"\n                "}
                      <button onClick={n.remove} style={{background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "6px 10px", fontSize: "12px", letterSpacing: "0.05em", cursor: "pointer"}} className="svh-16">{n.nome}{" ×"}</button>{"\n              "}</Fragment>))}{"\n              "}
                    {v.naCenaEmpty ? (<>
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", color: "var(--sv-dim2,#6f6a61)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%"}}>{"Ninguém. Chame NPCs pelo Elenco."}</div></>) : null}{"\n            "}</div>{"\n          "}</div>{"\n\n          "}
                <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px"}}>{"\n              "}
                    <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "22px", lineHeight: "1.1"}}>{v.fichaTitle}</div>{"\n              "}
                    <button onClick={v.goFicha} style={{background: "none", border: "none", color: "var(--sv-dim,#9b9488)", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", padding: "0"}}>{"Ficha →"}</button>{"\n            "}</div>{"\n            "}
                  {(v.tracks ?? []).map((tr: any, tr__i: number) => (<Fragment key={tr__i}>{"\n              "}
                    <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>{"\n                "}
                      <div style={{display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)"}}>
                        <span>{tr.label}</span>
                        <span style={{whiteSpace: "nowrap", color: "var(--sv-ink,#ebe5d6)"}}>{tr.v}{" · "}{tr.state}</span></div>{"\n                "}
                      <div style={{display: "flex", gap: "3px", alignItems: "center", flexWrap: "nowrap", minWidth: "0"}}>{"\n                  "}
                        <button onClick={tr.dec} style={{flex: "none", width: "28px", height: "28px", fontSize: "16px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)", padding: "0"}}>{"−"}</button>{"\n                  "}
                        {(tr.boxes ?? []).map((b: any, b__i: number) => (<Fragment key={b__i}>{"\n                    "}
                          {b.on ? (<>
                            <div style={{flex: "0 1 16px", minWidth: "6px", height: "16px", background: "var(--sv-ink,#ebe5d6)"}} /></>) : null}{"\n                    "}
                          {b.off ? (<>
                            <div style={{flex: "0 1 16px", minWidth: "6px", height: "16px", border: "1px solid var(--sv-line2,#3a3631)"}} /></>) : null}{"\n                  "}</Fragment>))}{"\n                  "}
                        <button onClick={tr.inc} style={{flex: "none", width: "28px", height: "28px", fontSize: "16px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)", padding: "0"}}>{"+"}</button>{"\n                "}</div>{"\n              "}</div>{"\n            "}</Fragment>))}{"\n          "}</div>{"\n\n          "}
                <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{display: "flex", justifyContent: "space-between", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)"}}>
                    <span>{"Vantagens · "}{v.vantN}</span>
                    <span>{"Problemas · "}{v.probN}</span></div>{"\n            "}
                  <div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>{"\n              "}
                    {(v.vantView ?? []).map((v: any, v__i: number) => (<Fragment key={v__i}>
                      <div style={{border: "1px solid var(--sv-ink,#ebe5d6)", padding: "4px 8px", fontSize: "12px"}}>{v.t}</div></Fragment>))}{"\n              "}
                    {(v.probView ?? []).map((p: any, p__i: number) => (<Fragment key={p__i}>
                      <div style={{border: "1px solid var(--sv-accent,#b0281f)", color: "var(--sv-accent-soft,#e3a29b)", padding: "4px 8px", fontSize: "12px"}}>{p.t}</div></Fragment>))}{"\n            "}</div>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", marginTop: "4px"}}>{"Pistas · "}{v.pistasN}{" · Peso "}{v.pesoTotal}{" de "}{v.caso.nec}</div>{"\n            "}
                  <button onClick={v.goCaso} style={{alignSelf: "flex-start", background: "none", border: "none", color: "var(--sv-dim,#9b9488)", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", padding: "0"}}>{"Abrir o caderno do caso →"}</button>{"\n          "}</div>{"\n        "}</div>{"\n      "}</div>{"\n    "}</>) : null}{"\n\n    "}
          {v.tabCaso ? (<>{"\n      "}
            <div style={{display: "flex", flexDirection: "column", gap: "24px"}}>{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px"}}>{"\n          "}
                <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "40px", textTransform: "uppercase", lineHeight: "1", color: "var(--sv-title,inherit)"}}>{"O Caso"}</div>{"\n          "}
                <button onClick={v.newCase} style={{background: "none", border: "1.5px solid var(--sv-accent,#b0281f)", color: "var(--sv-accent-soft,#e3a29b)", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", padding: "6px 10px", transform: "rotate(-1deg)"}} className="svh-17">{"Fechar caso e começar outro"}</button>{"\n        "}</div>{"\n        "}
              <div style={{background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", padding: "clamp(20px,4vw,36px)", display: "flex", flexDirection: "column", gap: "12px", clipPath: "polygon(0 0,100% 1.5%,100% 100%,0 98.5%)"}}>{"\n          "}
                <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase"}}>{v.geradorTitulo}</div>{"\n          "}
                <input value={v.caso.titulo} onChange={v.c_titulo} placeholder={"Título do caso"} style={{background: "transparent", border: "none", borderBottom: "2px solid var(--sv-bg,#0b0a09)", padding: "8px 0", fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "28px", outline: "none", color: "var(--sv-bg,#0b0a09)"}} />{"\n          "}
                <textarea value={v.caso.premissa} onChange={v.c_premissa} rows={3} placeholder={"A premissa: quem contrata, o que aconteceu, com quem."} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "12px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", lineHeight: "1.6", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} />{"\n          "}
                {v.hasSegredo ? (<>{"\n            "}
                  <div style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase"}}>{"\n              "}
                    <div style={{border: "2px solid var(--sv-accent,#b0281f)", color: "var(--sv-accent,#b0281f)", padding: "4px 10px", transform: "rotate(-2deg)", fontWeight: "600"}}>{"Segredo do Diretor"}</div>{"\n              "}
                    <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", textTransform: "none", letterSpacing: "0", fontSize: "14px"}}>{v.segredoView}</div>{"\n              "}
                    <button onClick={v.toggleSegredo} style={{background: "none", border: "none", color: "var(--sv-paperdim,#5a554d)", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"}}>{v.segredoBtn}</button>{"\n            "}</div>{"\n          "}</>) : null}{"\n          "}
                <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>{"\n            "}
                  <button onClick={v.rollGerador} style={{background: "none", border: "1px solid var(--sv-bg,#0b0a09)", color: "var(--sv-bg,#0b0a09)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{v.geradorBtn}</button>{"\n            "}
                  <button onClick={v.openCase} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 20px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Abrir o caso na crônica"}</button>{"\n            "}
                  <button onClick={v.askClue} style={{background: "none", border: "none", color: "var(--sv-paperdim,#5a554d)", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Pedir pista ao narrador"}</button>{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              {v.hasCasosLivro ? (<>{"\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"Arquivos do livro · casos prontos e Intermezzos"}</div>{"\n            "}
                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: "2px"}}>{"\n              "}
                    {(v.casosLivro ?? []).map((k: any, k__i: number) => (<Fragment key={k__i}>{"\n                "}
                      <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "8px"}}>{"\n                  "}
                        <div style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sv-accent2,#c8372b)"}}>{k.ano}</div>{"\n                  "}
                        <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "22px", lineHeight: "1.1"}}>{k.titulo}</div>{"\n                  "}
                        <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.55", color: "var(--sv-ink2,#cfc8b8)", display: "-webkit-box", WebkitLineClamp: "4", WebkitBoxOrient: "vertical", overflow: "hidden"}}>{k.premissa}</div>{"\n                  "}
                        <div style={{flex: "1"}} />{"\n                  "}
                        <button onClick={k.go} style={{alignSelf: "flex-start", background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}} className="svh-18">{"Carregar no caderno"}</button>{"\n                "}</div>{"\n              "}</Fragment>))}{"\n            "}</div>{"\n          "}</div>{"\n        "}</>) : null}{"\n        "}
              {v.hasGanchos ? (<>{"\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"Ganchos da era · d6"}</div>{"\n            "}
                  {(v.ganchos ?? []).map((g: any, g__i: number) => (<Fragment key={g__i}>{"\n              "}
                    <button onClick={g.go} style={{display: "flex", gap: "12px", alignItems: "baseline", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid var(--sv-line3,#1e1c19)", padding: "9px 0", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)"}} className="svh-19">
                      <span style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", color: "var(--sv-accent2,#c8372b)", minWidth: "16px"}}>{g.n}</span>
                      <span style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", lineHeight: "1.5"}}>{g.t}</span></button>{"\n            "}</Fragment>))}{"\n          "}</div>{"\n        "}</>) : null}{"\n\n        "}
              {v.hasMural ? (<>{"\n          "}
                <div style={{background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", padding: "clamp(18px,3vw,30px)", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap", borderBottom: "3px solid var(--sv-bg,#0b0a09)", paddingBottom: "10px"}}>{"\n              "}
                    <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "30px", textTransform: "uppercase", lineHeight: "1"}}>{"O Mural"}</div>{"\n              "}
                    <div style={{fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase"}}>{v.muralInfo}</div>{"\n            "}</div>{"\n            "}
                  <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", lineHeight: "1.55"}}>{"Cada pista anotada é um Cartão. Ligue dois com um Fio e diga a relação. Verificar custa 1 Impulso e o narrador nunca mente: firme ou cortado. Cada Fio firme vale uma Vantagem; três em triângulo trazem a Revelação."}</div>{"\n            "}
                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: "8px", alignItems: "end"}}>{"\n              "}
                    <select value={v.fioA} onChange={v.onFioA} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "8px", fontSize: "13px", color: "var(--sv-bg,#0b0a09)"}}>
                      <option value={""}>{"Cartão A"}</option>
                      {(v.pistaOpts ?? []).map((o: any, o__i: number) => (<Fragment key={o__i}>
                        <option value={o.id}>{o.label}</option></Fragment>))}</select>{"\n              "}
                    <select value={v.fioB} onChange={v.onFioB} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "8px", fontSize: "13px", color: "var(--sv-bg,#0b0a09)"}}>
                      <option value={""}>{"Cartão B"}</option>
                      {(v.pistaOpts ?? []).map((o: any, o__i: number) => (<Fragment key={o__i}>
                        <option value={o.id}>{o.label}</option></Fragment>))}</select>{"\n              "}
                    <input value={v.fioRel} onChange={v.onFioRel} placeholder={"A relação: o contador pagou o arquivista"} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "8px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", outline: "none", color: "var(--sv-bg,#0b0a09)"}} />{"\n              "}
                    <button onClick={v.addFio} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 14px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Ligar com um Fio"}</button>{"\n            "}</div>{"\n            "}
                  {(v.fiosView ?? []).map((f: any, f__i: number) => (<Fragment key={f__i}>{"\n              "}
                    <div style={{display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap", padding: "10px 0", borderTop: "1px solid var(--sv-bg,#0b0a09)"}}>{"\n                "}
                      <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "18px", color: "var(--sv-accent,#b0281f)", minWidth: "22px"}}>{f.n}</div>{"\n                "}
                      <div style={{flex: "1 1 260px", minWidth: "0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", lineHeight: "1.5"}}>{f.txt}</div>{"\n                "}
                      {f.isFirme ? (<>
                        <div style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", padding: "3px 8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase"}}>{"Firme"}</div></>) : null}{"\n                "}
                      {f.isCortado ? (<>
                        <div style={{border: "2px solid var(--sv-accent,#b0281f)", color: "var(--sv-accent,#b0281f)", padding: "2px 8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "line-through"}}>{"Cortado"}</div></>) : null}{"\n                "}
                      {f.isSolto ? (<>{"\n                  "}
                        <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>{"\n                    "}
                          <div style={{border: "1px dashed var(--sv-bg,#0b0a09)", padding: "3px 8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase"}}>{"Solto"}</div>{"\n                    "}
                          <button onClick={f.verify} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "6px 10px", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer"}}>{"Verificar · 1 Impulso"}</button>{"\n                    "}
                          <button onClick={f.act} style={{background: "none", border: "1px solid var(--sv-bg,#0b0a09)", color: "var(--sv-bg,#0b0a09)", padding: "6px 10px", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer"}}>{"Agir sobre ele"}</button>{"\n                  "}</div>{"\n                "}</>) : null}{"\n                "}
                      <button onClick={f.del} style={{background: "none", border: "none", color: "var(--sv-paperdim,#5a554d)", cursor: "pointer", padding: "4px 8px", fontSize: "18px", lineHeight: "1", minWidth: "32px", minHeight: "32px"}} aria-label={"Remover"}>{"×"}</button>{"\n              "}</div>{"\n            "}</Fragment>))}{"\n          "}</div>{"\n        "}</>) : null}{"\n\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "24px"}}>{"\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"Pistas anotadas"}</div>{"\n            "}
                  {(v.pistasView ?? []).map((p: any, p__i: number) => (<Fragment key={p__i}>{"\n              "}
                    <div style={{display: "flex", gap: "12px", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--sv-line3,#1e1c19)"}}>{"\n                "}
                      <div style={{color: "var(--sv-accent2,#c8372b)", fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900"}}>{p.n}</div>{"\n                "}
                      <div style={{flex: "1", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", lineHeight: "1.5"}}>{p.t}</div>{"\n                "}
                      <button onClick={p.del} style={{background: "none", border: "none", color: "var(--sv-dim2,#6f6a61)", cursor: "pointer", padding: "4px 8px", fontSize: "18px", lineHeight: "1", minWidth: "32px", minHeight: "32px"}} aria-label={"Remover"}>{"×"}</button>{"\n              "}</div>{"\n            "}</Fragment>))}{"\n            "}
                  <div style={{display: "flex", gap: "0"}}>{"\n              "}
                    <input value={v.pistaDraft} onChange={v.onPistaDraft} placeholder={"Anotar pista"} style={{flex: "1", minWidth: "0", background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "9px 12px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", outline: "none"}} />{"\n              "}
                    <button onClick={v.addPista} style={{background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "0 14px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"+"}</button>{"\n            "}</div>{"\n          "}</div>{"\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"\n              "}
                    <span>{"Provas · Peso "}{v.pesoTotal}</span>{"\n              "}
                    <select value={v.caso.nec} onChange={v.c_nec} style={{background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "4px 6px", fontSize: "12px", letterSpacing: "0.05em", textTransform: "none"}}>{"\n                "}
                      <option value={"4"}>{"Necessário 4 · ninguém importante"}</option>{"\n                "}
                      <option value={"6"}>{"Necessário 6 · alguém com advogado"}</option>{"\n                "}
                      <option value={"9"}>{"Necessário 9 · protegido por facção"}</option>{"\n                "}
                      <option value={"12"}>{"Necessário 12 · intocável"}</option>{"\n              "}</select>{"\n            "}</div>{"\n            "}
                  <div style={{height: "6px", background: "var(--sv-line3,#1e1c19)", position: "relative"}}>
                    <div style={{position: "absolute", left: "0", top: "0", bottom: "0", background: "var(--sv-accent,#b0281f)", width: v.pesoPct}} /></div>{"\n            "}
                  {(v.provasView ?? []).map((p: any, p__i: number) => (<Fragment key={p__i}>{"\n              "}
                    <div style={{display: "flex", gap: "12px", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--sv-line3,#1e1c19)"}}>{"\n                "}
                      <div style={{flex: "1", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", lineHeight: "1.5"}}>{p.t}</div>{"\n                "}
                      <div style={{fontSize: "12px", letterSpacing: "0.15em", whiteSpace: "nowrap"}}>{"PESO "}{p.peso}</div>{"\n                "}
                      <button onClick={p.del} style={{background: "none", border: "none", color: "var(--sv-dim2,#6f6a61)", cursor: "pointer", padding: "4px 8px", fontSize: "18px", lineHeight: "1", minWidth: "32px", minHeight: "32px"}} aria-label={"Remover"}>{"×"}</button>{"\n              "}</div>{"\n            "}</Fragment>))}{"\n            "}
                  <div style={{display: "flex", gap: "0"}}>{"\n              "}
                    <input value={v.provaDraft} onChange={v.onProvaDraft} placeholder={"Registrar prova"} style={{flex: "1", minWidth: "0", background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "9px 12px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", outline: "none"}} />{"\n              "}
                    <select value={v.provaPeso} onChange={v.onProvaPeso} style={{background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "0 6px", fontSize: "13px"}}>
                      <option value={"1"}>{"1"}</option>
                      <option value={"2"}>{"2"}</option>
                      <option value={"3"}>{"3"}</option></select>{"\n              "}
                    <button onClick={v.addProva} style={{background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "0 14px", fontSize: "12px", cursor: "pointer"}}>{"+"}</button>{"\n            "}</div>{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "24px"}}>{"\n          "}
                {(v.vpBlocks ?? []).map((bl: any, bl__i: number) => (<Fragment key={bl__i}>{"\n            "}
                  <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n              "}
                    <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{bl.title}</div>{"\n              "}
                    <div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>{"\n                "}
                      {(bl.items ?? []).map((it: any, it__i: number) => (<Fragment key={it__i}>
                        <button onClick={it.del} style={{background: "none", border: "1px solid var(--sv-ink,#ebe5d6)", color: "var(--sv-ink,#ebe5d6)", padding: "6px 10px", fontSize: "13px", cursor: "pointer"}} className="svh-20">{it.t}{" ×"}</button></Fragment>))}{"\n              "}</div>{"\n              "}
                    <div style={{display: "flex", flexWrap: "wrap", gap: "4px"}}>{"\n                "}
                      {(bl.sugs ?? []).map((sg: any, sg__i: number) => (<Fragment key={sg__i}>
                        <button onClick={sg.add} style={{background: "var(--sv-panel,#161412)", border: "none", color: "var(--sv-dim,#9b9488)", padding: "6px 10px", fontSize: "11px", letterSpacing: "0.05em", cursor: "pointer"}} className="svh-21">{"+ "}{sg.t}</button></Fragment>))}{"\n              "}</div>{"\n            "}</div>{"\n          "}</Fragment>))}{"\n        "}</div>{"\n        "}
              <div style={{border: "1px solid var(--sv-line2,#3a3631)", padding: "16px 18px", display: "flex", gap: "12px", alignItems: "baseline", flexWrap: "wrap"}}>{"\n          "}
                <div style={{fontSize: "12px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sv-accent2,#c8372b)"}}>{"No clímax"}</div>{"\n          "}
                <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", lineHeight: "1.5", flex: "1", minWidth: "240px"}}>{v.climax}</div>{"\n        "}</div>{"\n      "}</div>{"\n    "}</>) : null}{"\n\n    "}
          {v.tabFicha ? (<>{"\n      "}
            <div style={{background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", padding: "clamp(20px,4vw,44px)", display: "flex", flexDirection: "column", gap: "32px"}}>{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", borderBottom: "3px solid var(--sv-bg,#0b0a09)", paddingBottom: "14px"}}>{"\n          "}
                <div style={{flex: "1 1 320px", minWidth: "0"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase", lineHeight: "1.6"}}>{"Ficha do "}{v.pjLabel}{" · "}{v.eraTitulo}{" · jogo solo"}</div>{"\n            "}
                  <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "40px", textTransform: "uppercase", lineHeight: "1.05", marginTop: "14px"}}>{v.fichaTitle}</div>{"\n          "}</div>{"\n          "}
                {v.hasProntos ? (<>{"\n          "}
                  <div style={{display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end"}}>{"\n            "}
                    <div style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{"Carregar pronto"}</div>{"\n            "}
                    <select value={""} onChange={v.loadPronto} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "8px 10px", fontSize: "14px", color: "var(--sv-bg,#0b0a09)"}}>{"\n              "}
                      <option value={""}>{"Escolher…"}</option>{"\n              "}
                      {(v.prontos ?? []).map((p: any, p__i: number) => (<Fragment key={p__i}>
                        <option value={p.i}>{p.nome}{" · "}{p.arq}</option></Fragment>))}{"\n            "}</select>{"\n          "}</div>{"\n          "}</>) : null}{"\n        "}</div>{"\n\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: "16px"}}>{"\n          "}
                <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                  <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{"Nome"}</span>
                  <input value={v.char.nome} onChange={v.f_nome} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "6px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "18px", outline: "none", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n          "}
                <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                  <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{"Arquétipo"}</span>{"\n            "}
                  <select value={v.char.arq} onChange={v.f_arq} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "6px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", outline: "none", color: "var(--sv-bg,#0b0a09)"}}>
                    <option value={""}>{"—"}</option>
                    {(v.arqOptions ?? []).map((o: any, o__i: number) => (<Fragment key={o__i}>
                      <option value={o.n}>{o.n}</option></Fragment>))}</select></label>{"\n          "}
                <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                  <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{v.oriLabel}</span>{"\n            "}
                  <select value={v.char.ori} onChange={v.f_ori} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "6px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", outline: "none", color: "var(--sv-bg,#0b0a09)"}}>
                    <option value={""}>{"—"}</option>
                    {(v.oriOptions ?? []).map((o: any, o__i: number) => (<Fragment key={o__i}>
                      <option value={o}>{o}</option></Fragment>))}</select></label>{"\n          "}
                <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                  <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{v.motLabel}</span>{"\n            "}
                  <select value={v.motValue} onChange={v.f_mot} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "6px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", outline: "none", color: "var(--sv-bg,#0b0a09)"}}>
                    <option value={""}>{"—"}</option>
                    {(v.motOptions ?? []).map((o: any, o__i: number) => (<Fragment key={o__i}>
                      <option value={o}>{o}</option></Fragment>))}</select></label>{"\n        "}</div>{"\n        "}
              {v.hasArqInfo ? (<>{"\n          "}
                <div style={{display: "flex", gap: "16px", flexWrap: "wrap", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", lineHeight: "1.5", marginTop: "-12px"}}>{"\n            "}
                  <div>
                    <span style={{fontFamily: "'Oswald',sans-serif", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase"}}>{"Vantagem · "}</span>{v.arqInfo.v}</div>{"\n            "}
                  <div>
                    <span style={{fontFamily: "'Oswald',sans-serif", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sv-accent,#b0281f)"}}>{"Problema · "}</span>{v.arqInfo.p}</div>{"\n            "}
                  <div>
                    <span style={{fontFamily: "'Oswald',sans-serif", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase"}}>{"Sugeridas · "}</span>{v.arqInfo.inv}</div>{"\n            "}
                  {v.hasOriInfo ? (<>
                    <div>
                      <span style={{fontFamily: "'Oswald',sans-serif", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase"}}>{"Origem · "}</span>{v.oriInfo}</div></>) : null}{"\n          "}</div>{"\n        "}</>) : null}{"\n        "}
              <label style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{"Conceito · quem você é para a cidade, o que fez de errado, por que não foi embora"}</span>
                <textarea value={v.char.conceito} onChange={v.f_conceito} rows={2} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid var(--sv-bg,#0b0a09)", paddingBottom: "6px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase"}}>{"Habilidades investigativas · nunca falham"}</div>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase"}}>{v.extrasLabel}</div>{"\n          "}</div>{"\n          "}
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "4px 22px"}}>{"\n            "}
                  {(v.invView ?? []).map((s: any, s__i: number) => (<Fragment key={s__i}>{"\n              "}
                    <div style={{display: "flex", alignItems: "center", gap: "8px", padding: "3px 0"}}>{"\n                "}
                      <div style={{flex: "1", fontSize: "14px", letterSpacing: "0.05em"}}>{s.k}</div>{"\n                "}
                      <button onClick={s.dec} style={{width: "22px", height: "22px", background: "none", border: "1px solid var(--sv-bg,#0b0a09)", cursor: "pointer", color: "var(--sv-bg,#0b0a09)", padding: "0", fontSize: "12px"}}>{"−"}</button>{"\n                "}
                      <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "18px", width: "18px", textAlign: "center"}}>{s.v}</div>{"\n                "}
                      <button onClick={s.inc} style={{width: "22px", height: "22px", background: "none", border: "1px solid var(--sv-bg,#0b0a09)", cursor: "pointer", color: "var(--sv-bg,#0b0a09)", padding: "0", fontSize: "12px"}}>{"+"}</button>{"\n              "}</div>{"\n            "}</Fragment>))}{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid var(--sv-bg,#0b0a09)", paddingBottom: "6px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase"}}>{"Gerais · escolha três especialidades (+1 no teste)"}</div>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase"}}>{v.espLabel}</div>{"\n          "}</div>{"\n          "}
                <div style={{display: "flex", flexWrap: "wrap", gap: "4px"}}>{"\n            "}
                  {(v.geraisView ?? []).map((g: any, g__i: number) => (<Fragment key={g__i}>{"\n              "}
                    {g.on ? (<>
                      <button onClick={g.toggle} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px 14px", fontSize: "13px", letterSpacing: "0.08em", cursor: "pointer"}}>{g.k}{" +1"}</button></>) : null}{"\n              "}
                    {g.off ? (<>
                      <button onClick={g.toggle} style={{background: "transparent", color: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px 14px", fontSize: "13px", letterSpacing: "0.08em", cursor: "pointer"}}>{g.k}</button></>) : null}{"\n            "}</Fragment>))}{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "24px"}}>{"\n          "}
                {(v.tracks ?? []).map((tr: any, tr__i: number) => (<Fragment key={tr__i}>{"\n            "}
                  <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>{"\n              "}
                    <div style={{display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase", borderBottom: "1px solid var(--sv-bg,#0b0a09)", paddingBottom: "6px"}}>
                      <span>{tr.label}</span>
                      <span style={{whiteSpace: "nowrap", flex: "none"}}>{tr.v}{" · "}{tr.state}</span></div>{"\n              "}
                    <div style={{display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap"}}>{"\n                "}
                      <button onClick={tr.dec} style={{width: "28px", height: "28px", background: "none", border: "1px solid var(--sv-bg,#0b0a09)", cursor: "pointer", color: "var(--sv-bg,#0b0a09)"}}>{"−"}</button>{"\n                "}
                      {(tr.boxes ?? []).map((b: any, b__i: number) => (<Fragment key={b__i}>{"\n                  "}
                        {b.on ? (<>
                          <div style={{width: "20px", height: "20px", background: "var(--sv-bg,#0b0a09)"}} /></>) : null}{"\n                  "}
                        {b.off ? (<>
                          <div style={{width: "20px", height: "20px", border: "1px solid var(--sv-bg,#0b0a09)"}} /></>) : null}{"\n                "}</Fragment>))}{"\n                "}
                      <button onClick={tr.inc} style={{width: "28px", height: "28px", background: "none", border: "1px solid var(--sv-bg,#0b0a09)", cursor: "pointer", color: "var(--sv-bg,#0b0a09)"}}>{"+"}</button>{"\n              "}</div>{"\n              "}
                    <div style={{fontSize: "12px", letterSpacing: "0.05em", color: "var(--sv-paperdim,#5a554d)"}}>{tr.hint}</div>{"\n            "}</div>{"\n          "}</Fragment>))}{"\n        "}</div>{"\n\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "16px"}}>{"\n          "}
                {v.hasCodigo ? (<>{"\n            "}
                  <label style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                    <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase"}}>{"As três regras do Código"}</span>
                    <textarea value={v.char.regras} onChange={v.f_regras} rows={3} placeholder={"Não atiro pelas costas; não deixo criança no meio; não aceito dinheiro de tira."} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n          "}</>) : null}{"\n          "}
                <label style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                  <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase"}}>{"Fontes de Sangue-Frio"}</span>
                  <textarea value={v.char.fontes} onChange={v.f_fontes} rows={3} placeholder={"Uma pessoa, um hábito, um traço (ou um lugar)."} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>{"\n            "}
                  <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase"}}>{"Vício · a Garrafa"}</span>{"\n            "}
                  <input value={v.char.vicio} onChange={v.f_vicio} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "6px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", outline: "none", color: "var(--sv-bg,#0b0a09)"}} />{"\n            "}
                  <div style={{display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase"}}>{"\n              "}
                    <span>{"Traços"}</span>{"\n              "}
                    {(v.vicioBoxes ?? []).map((b: any, b__i: number) => (<Fragment key={b__i}>{"\n                "}
                      {b.on ? (<>
                        <div style={{width: "18px", height: "18px", background: "var(--sv-accent,#b0281f)"}} /></>) : null}{"\n                "}
                      {b.off ? (<>
                        <div style={{width: "18px", height: "18px", border: "1px solid var(--sv-bg,#0b0a09)"}} /></>) : null}{"\n              "}</Fragment>))}{"\n              "}
                    <button onClick={v.useVicio} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "6px 10px", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"}}>{"Ceder ao vício (+2 SF)"}</button>{"\n            "}</div>{"\n          "}</div>{"\n          "}
                <label style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                  <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--sv-accent,#b0281f)"}}>{"Segredo · o narrador usa uma vez, no pior momento"}</span>
                  <textarea value={v.char.segredo} onChange={v.f_segredo} rows={3} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n          "}
                <label style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                  <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase"}}>{"Equipamento"}</span>
                  <textarea value={v.char.equip} onChange={v.f_equip} rows={3} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n          "}
                <label style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                  <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase"}}>{"Notas, contatos, laço"}</span>
                  <textarea value={v.char.notas} onChange={v.f_notas} rows={3} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n        "}</div>{"\n        "}
              {v.hasMedalha ? (<>{"\n          "}
                <div style={{display: "flex", gap: "12px 18px", alignItems: "flex-end", flexWrap: "wrap", borderTop: "1px solid var(--sv-bg,#0b0a09)", paddingTop: "14px"}}>{"\n            "}
                  <label style={{flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "4px"}}>
                    <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase"}}>{"A Medalha · qual, e onde a ganhou"}</span>
                    <input value={v.char.medalha} onChange={v.f_medalha} placeholder={"Estrela de Bronze, Guadalcanal"} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "6px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", outline: "none", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n            "}
                  <button onClick={v.useMedalha} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Mostrar a medalha"}</button>{"\n            "}
                  <div style={{flex: "1 1 100%", fontSize: "12px", letterSpacing: "0.05em", color: "var(--sv-paperdim,#5a554d)"}}>{"Usos neste caso: "}{v.medalhaUsos}{" · o primeiro dá +2 num teste social diante de autoridade · Sangue-Frio contra 4, falha perde 2 · três usos: um traço de Vício"}</div>{"\n          "}</div>{"\n        "}</>) : null}{"\n\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "16px", borderTop: "3px solid var(--sv-bg,#0b0a09)", paddingTop: "16px"}}>{"\n          "}
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", flexWrap: "wrap"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase"}}>{"Ficha do Século · herança e saltos de era"}</div>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase"}}>{v.idadeLabel}</div>{"\n          "}</div>{"\n          "}
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: "16px"}}>{"\n            "}
                  <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                    <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{"Ano de nascimento"}</span>
                    <input value={v.char.anoNasc} onChange={v.f_anoNasc} placeholder={"1893"} inputMode={"numeric"} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "6px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", outline: "none", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n            "}
                  <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                    <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{"Laço de Herança · era ou ano"}</span>
                    <input value={v.char.lacoEra} onChange={v.f_lacoEra} placeholder={"1935"} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "6px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", outline: "none", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n            "}
                  <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                    <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{"Herdado de"}</span>
                    <input value={v.char.lacoDe} onChange={v.f_lacoDe} placeholder={"Eddie Lum"} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-bg,#0b0a09)", padding: "6px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", outline: "none", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n          "}</div>{"\n          "}
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "16px"}}>{"\n            "}
                  <label style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                    <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase"}}>{"Heranças recebidas"}</span>
                    <textarea value={v.char.herancas} onChange={v.f_herancas} rows={3} placeholder={"Objeto, Nome, Dívida a favor ou contra, Segredo ou Ferida, uma linha cada."} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n            "}
                  <label style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                    <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase"}}>{"Antepassado · para o flashback"}</span>
                    <textarea value={v.char.antepassado} onChange={v.f_antepassado} rows={3} placeholder={"Nome, ano, ofício. Quatro investigativas com 2 e quatro gerais com 6."} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n            "}
                  <label style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                    <span style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase"}}>{"Testamento · o que você deixa"}</span>
                    <textarea value={v.char.testamento} onChange={v.f_testamento} rows={3} placeholder={"Uma Herança por caso jogado; três numa campanha, uma delas Ferida ou Dívida contra."} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "10px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none", resize: "vertical", color: "var(--sv-bg,#0b0a09)"}} /></label>{"\n          "}</div>{"\n          "}
                <div style={{display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center"}}>{"\n            "}
                  {v.canFlash ? (<>
                    <button onClick={v.doFlash} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{v.flashLabel}</button></>) : null}{"\n            "}
                  {v.canJaVi ? (<>
                    <button onClick={v.doJaVi} style={{background: "none", border: "1px solid var(--sv-bg,#0b0a09)", color: "var(--sv-bg,#0b0a09)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Já vi isso antes"}</button></>) : null}{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.05em", color: "var(--sv-paperdim,#5a554d)", flex: "1 1 220px"}}>{v.flashInfo}</div>{"\n          "}</div>{"\n          "}
                {v.hasSalto ? (<>{"\n            "}
                  <div style={{display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", borderTop: "1px solid var(--sv-bg,#0b0a09)", paddingTop: "14px"}}>{"\n              "}
                    <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{"Levar para"}</span>{"\n              "}
                    <select value={v.saltoEra} onChange={v.onSaltoEra} style={{background: "transparent", border: "1px solid var(--sv-bg,#0b0a09)", padding: "8px 10px", fontSize: "14px", color: "var(--sv-bg,#0b0a09)"}}>
                      {(v.saltoOptions ?? []).map((o: any, o__i: number) => (<Fragment key={o__i}>
                        <option value={o.e}>{o.label}</option></Fragment>))}</select>{"\n              "}
                    <button onClick={v.jumpSame} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 14px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"O mesmo, envelhecido"}</button>{"\n              "}
                    <button onClick={v.jumpHeir} style={{background: "none", border: "1px solid var(--sv-bg,#0b0a09)", color: "var(--sv-bg,#0b0a09)", padding: "10px 14px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Um herdeiro, com o testamento"}</button>{"\n            "}</div>{"\n          "}</>) : null}{"\n        "}</div>{"\n        "}
              <div style={{display: "flex", justifyContent: "flex-end"}}>
                <button onClick={v.resetChar} style={{background: "none", border: "2px solid var(--sv-accent,#b0281f)", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", color: "var(--sv-accent,#b0281f)", padding: "6px 10px", fontWeight: "600", transform: "rotate(-1deg)"}} className="svh-22">{"Apagar ficha"}</button></div>{"\n      "}</div>{"\n    "}</>) : null}{"\n\n    "}
          {v.tabDados ? (<>{"\n      "}
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "24px", alignItems: "start"}}>{"\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "24px"}}>{"\n          "}
                <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "40px", textTransform: "uppercase", lineHeight: "1", color: "var(--sv-title,inherit)"}}>{"Os Dados"}</div>{"\n          "}
                <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--sv-accent2,#c8372b)"}}>{"Teste solo · Revés, Empate, Avanço"}</div>{"\n            "}
                  <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", color: "var(--sv-dim,#9b9488)", lineHeight: "1.5"}}>{"1d6 + modificadores. Especialidade +1; Ferido ou Abalado −1."}</div>{"\n            "}
                  <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>{"\n              "}
                    <select value={v.soloHab} onChange={v.onSoloHab} style={{flex: "1", minWidth: "160px", background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "9px 10px", fontSize: "14px"}}>
                      {(v.geraisView ?? []).map((g: any, g__i: number) => (<Fragment key={g__i}>
                        <option value={g.k}>{g.label}</option></Fragment>))}</select>{"\n              "}
                    <div style={{display: "flex", alignItems: "center", gap: "8px"}}>{"\n                "}
                      <button onClick={v.soloModDec} style={{width: "32px", height: "36px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)"}}>{"−"}</button>{"\n                "}
                      <div style={{minWidth: "34px", textAlign: "center"}}>{v.soloModLabel}</div>{"\n                "}
                      <button onClick={v.soloModInc} style={{width: "32px", height: "36px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)"}}>{"+"}</button>{"\n              "}</div>{"\n              "}
                    <button onClick={v.rollSolo} style={{background: "var(--sv-accent,#b0281f)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 20px", fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer"}}>{"Rolar"}</button>{"\n            "}</div>{"\n          "}</div>{"\n          "}
                <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--sv-accent2,#c8372b)"}}>{"Regra de ouro · 1d6 + gasto ≥ Dificuldade"}</div>{"\n            "}
                  <div style={{display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)"}}>{"\n              "}
                    <span>{"Gasto"}</span>
                    <button onClick={v.goldGDec} style={{width: "30px", height: "30px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)"}}>{"−"}</button>
                    <span style={{color: "var(--sv-ink,#ebe5d6)", fontSize: "18px", minWidth: "16px", textAlign: "center"}}>{v.gold.gasto}</span>
                    <button onClick={v.goldGInc} style={{width: "30px", height: "30px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)"}}>{"+"}</button>{"\n              "}
                    <span>{"Dif."}</span>
                    <button onClick={v.goldDDec} style={{width: "30px", height: "30px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)"}}>{"−"}</button>
                    <span style={{color: "var(--sv-ink,#ebe5d6)", fontSize: "18px", minWidth: "16px", textAlign: "center"}}>{v.gold.dif}</span>
                    <button onClick={v.goldDInc} style={{width: "30px", height: "30px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)"}}>{"+"}</button>{"\n              "}
                    <button onClick={v.rollGold} style={{marginLeft: "auto", background: "var(--sv-accent,#b0281f)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 20px", fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer"}}>{"Rolar"}</button>{"\n            "}</div>{"\n          "}</div>{"\n          "}
                <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--sv-accent2,#c8372b)"}}>{"Dano · 1d6 + arma"}</div>{"\n            "}
                  <div style={{display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center"}}>{"\n              "}
                    <select value={v.danoArma} onChange={v.onDanoArma} style={{flex: "1", minWidth: "180px", background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "9px 10px", fontSize: "14px"}}>
                      {(v.armas ?? []).map((a: any, a__i: number) => (<Fragment key={a__i}>
                        <option value={a.i}>{a.label}</option></Fragment>))}</select>{"\n              "}
                    <button onClick={v.toggleQR} style={{background: "none", border: "1px solid var(--sv-line2,#3a3631)", color: "var(--sv-ink,#ebe5d6)", padding: "9px 12px", fontSize: "12px", letterSpacing: "0.1em", cursor: "pointer"}}>{v.qrLabel}</button>{"\n              "}
                    <button onClick={v.rollDano} style={{background: "var(--sv-accent,#b0281f)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 20px", fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer"}}>{"Rolar"}</button>{"\n            "}</div>{"\n          "}</div>{"\n          "}
                <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--sv-accent2,#c8372b)"}}>{"Choque de Sangue-Frio · Dif. 4"}</div>{"\n            "}
                  <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>{"\n              "}
                    <select value={v.choqueI} onChange={v.onChoque} style={{flex: "1", minWidth: "200px", background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "9px 10px", fontSize: "14px"}}>
                      {(v.choques ?? []).map((c: any, c__i: number) => (<Fragment key={c__i}>
                        <option value={c.i}>{c.label}</option></Fragment>))}</select>{"\n              "}
                    <button onClick={v.rollChoqueSel} style={{background: "var(--sv-accent,#b0281f)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 20px", fontSize: "13px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer"}}>{"Rolar"}</button>{"\n            "}</div>{"\n          "}</div>{"\n          "}
                <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--sv-accent2,#c8372b)"}}>{"Tabelas do livro"}</div>{"\n            "}
                  <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>{"\n              "}
                    {(v.tabelas ?? []).map((tb: any, tb__i: number) => (<Fragment key={tb__i}>
                      <button onClick={tb.go} style={{background: "none", border: "1px solid var(--sv-ink,#ebe5d6)", color: "var(--sv-ink,#ebe5d6)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer"}} className="svh-23">{tb.label}</button></Fragment>))}{"\n            "}</div>{"\n            "}
                  <div style={{display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)"}}>{"\n              "}
                    <span>{"Dados livres"}</span>{"\n              "}
                    <button onClick={v.livreDec} style={{width: "30px", height: "30px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)"}}>{"−"}</button>{"\n              "}
                    <span style={{color: "var(--sv-ink,#ebe5d6)", fontSize: "16px"}}>{v.livre.n}</span>{"\n              "}
                    <button onClick={v.livreInc} style={{width: "30px", height: "30px", background: "none", border: "1px solid var(--sv-line2,#3a3631)", cursor: "pointer", color: "var(--sv-ink,#ebe5d6)"}}>{"+"}</button>{"\n              "}
                    <button onClick={v.rollD6} style={{background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "10px 16px", fontSize: "13px", cursor: "pointer"}}>{"d6"}</button>{"\n              "}
                    <button onClick={v.rollD8} style={{background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "10px 16px", fontSize: "13px", cursor: "pointer"}}>{"d8"}</button>{"\n            "}</div>{"\n          "}</div>{"\n        "}</div>{"\n        "}
              <div style={{position: "sticky", top: "120px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{background: "var(--sv-hicard,var(--sv-paper,#e9e3d3))", color: "var(--sv-bg,#0b0a09)", padding: "30px", minHeight: "280px", display: "flex", flexDirection: "column", gap: "12px", clipPath: "polygon(0 0,100% 2%,100% 100%,0 98%)"}}>{"\n            "}
                  {v.noDiceRes ? (<>
                    <div style={{margin: "auto", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", color: "var(--sv-paperdim,#5a554d)", textAlign: "center"}}>{"O dado cai aqui."}</div></>) : null}{"\n            "}
                  {v.hasDiceRes ? (<>{"\n              "}
                    <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase"}}>{v.diceRes.title}</div>{"\n              "}
                    <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "clamp(48px,8vw,84px)", lineHeight: "0.9", textTransform: "uppercase", animation: "svroll .35s ease-out"}}>{v.diceRes.big}</div>{"\n              "}
                    <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "16px", lineHeight: "1.5"}}>{v.diceRes.detail}</div>{"\n              "}
                    <div style={{flex: "1"}} />{"\n              "}
                    <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>{"\n                "}
                      {v.diceResNotLogged ? (<>
                        <button onClick={v.diceToLog} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Registrar na crônica"}</button></>) : null}{"\n                "}
                      <button onClick={v.diceNarrate} style={{background: "none", border: "1px solid var(--sv-bg,#0b0a09)", color: "var(--sv-bg,#0b0a09)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Narrador interpreta"}</button>{"\n              "}</div>{"\n            "}</>) : null}{"\n          "}</div>{"\n          "}
                <div style={{fontSize: "12px", letterSpacing: "0.1em", color: "var(--sv-dim2,#6f6a61)", lineHeight: "1.5"}}>{"Testes de habilidade e choques também alteram a ficha e aparecem na crônica."}</div>{"\n        "}</div>{"\n      "}</div>{"\n    "}</>) : null}{"\n\n    "}
          {v.tabElenco ? (<>{"\n      "}
            <div style={{display: "flex", flexDirection: "column", gap: "24px"}}>{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px"}}>{"\n          "}
                <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "40px", textTransform: "uppercase", lineHeight: "1", color: "var(--sv-title,inherit)"}}>{"Elenco"}</div>{"\n          "}
                <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", color: "var(--sv-dim,#9b9488)"}}>{v.elencoCount}{" Personagens do Diretor do livro · virtude, pecado, quer, teme"}</div>{"\n        "}</div>{"\n        "}
              <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>{"\n          "}
                <input value={v.npcQ} onChange={v.onNpcQ} placeholder={"Buscar por nome ou papel"} style={{flex: "1", minWidth: "200px", background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "10px 14px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none"}} />{"\n          "}
                <select value={v.npcReg} onChange={v.onNpcReg} style={{background: "var(--sv-bg,#0b0a09)", border: "1px solid var(--sv-line2,#3a3631)", padding: "10px", fontSize: "14px"}}>
                  <option value={""}>{"Todas as regiões"}</option>
                  <option value={"__cena"}>{"Só os em cena"}</option>
                  <option value={"__meus"}>{"Criados por mim"}</option>
                  {(v.regionOptions ?? []).map((o: any, o__i: number) => (<Fragment key={o__i}>
                    <option value={o.nome}>{o.nome}</option></Fragment>))}</select>{"\n        "}</div>{"\n        "}
              <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: "12px", alignItems: "end"}}>{"\n          "}
                <input value={v.npcForm.nome} onChange={v.n_nome} placeholder={"Novo NPC · nome"} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-line2,#3a3631)", padding: "8px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none"}} />{"\n          "}
                <input value={v.npcForm.papel} onChange={v.n_papel} placeholder={"Papel"} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-line2,#3a3631)", padding: "8px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none"}} />{"\n          "}
                <input value={v.npcForm.desc} onChange={v.n_desc} placeholder={"Virtude, pecado, o que quer"} style={{background: "transparent", border: "none", borderBottom: "1px solid var(--sv-line2,#3a3631)", padding: "8px 0", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", outline: "none"}} />{"\n          "}
                <div style={{display: "flex", gap: "8px"}}>{"\n            "}
                  <button onClick={v.addNpc} style={{flex: "1", background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "10px 14px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Adicionar"}</button>{"\n            "}
                  <button onClick={v.genNpc} style={{flex: "1", background: "none", border: "1px solid var(--sv-ink,#ebe5d6)", color: "var(--sv-ink,#ebe5d6)", padding: "10px 14px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Gerar"}</button>{"\n          "}</div>{"\n        "}</div>{"\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,320px),1fr))", gap: "2px"}}>{"\n          "}
                {(v.npcView ?? []).map((n: any, n__i: number) => (<Fragment key={n__i}>{"\n            "}
                  <div style={{background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", padding: "20px", display: "flex", flexDirection: "column", gap: "8px"}}>{"\n              "}
                    <div style={{display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase"}}>
                      <span style={{color: "var(--sv-accent,#b0281f)"}}>{n.r}</span>
                      {n.inScene ? (<>
                        <span style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", padding: "2px 6px"}}>{"Em cena"}</span></>) : null}</div>{"\n              "}
                    <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "24px", lineHeight: "1.05"}}>{n.n}</div>{"\n              "}
                    <div style={{fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase"}}>{n.p}</div>{"\n              "}
                    <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", lineHeight: "1.5"}}>{n.d}</div>{"\n              "}
                    {n.hasQuad ? (<>{"\n                "}
                      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.45", borderTop: "1px solid var(--sv-bg,#0b0a09)", paddingTop: "8px"}}>{"\n                  "}
                        <div>
                          <div style={{fontFamily: "'Oswald',sans-serif", fontSize: "11px", letterSpacing: "0.18em"}}>{"VIRTUDE"}</div>{n.v}</div>{"\n                  "}
                        <div>
                          <div style={{fontFamily: "'Oswald',sans-serif", fontSize: "11px", letterSpacing: "0.18em", color: "var(--sv-accent,#b0281f)"}}>{"PECADO"}</div>{n.pe}</div>{"\n                  "}
                        <div>
                          <div style={{fontFamily: "'Oswald',sans-serif", fontSize: "11px", letterSpacing: "0.18em"}}>{"QUER"}</div>{n.q}</div>{"\n                  "}
                        <div>
                          <div style={{fontFamily: "'Oswald',sans-serif", fontSize: "11px", letterSpacing: "0.18em"}}>{"TEME"}</div>{n.t}</div>{"\n                "}</div>{"\n              "}</>) : null}{"\n              "}
                    <div style={{flex: "1"}} />{"\n              "}
                    <div style={{display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px"}}>{"\n                "}
                      <button onClick={n.talk} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 14px", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"}}>{"Conversar"}</button>{"\n                "}
                      <button onClick={n.toggle} style={{background: "none", border: "1px solid var(--sv-bg,#0b0a09)", color: "var(--sv-bg,#0b0a09)", padding: "10px 14px", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"}}>{n.toggleLabel}</button>{"\n                "}
                      {n.custom ? (<>
                        <button onClick={n.del} style={{background: "none", border: "none", color: "var(--sv-paperdim,#5a554d)", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"}}>{"Remover"}</button></>) : null}{"\n              "}</div>{"\n            "}</div>{"\n          "}</Fragment>))}{"\n        "}</div>{"\n      "}</div>{"\n    "}</>) : null}{"\n\n    "}
          {v.tabCidade ? (<>{"\n      "}
            <div style={{display: "flex", flexDirection: "column", gap: "24px"}}>{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px"}}>{"\n          "}
                <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "40px", textTransform: "uppercase", lineHeight: "1", color: "var(--sv-title,inherit)"}}>{"A Cidade · "}{v.era}</div>{"\n          "}
                <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", color: "var(--sv-dim,#9b9488)", maxWidth: "100%", textWrap: "balance"}}>{"Cada região tem um dono. Ao ir para uma região, o narrador lê o capítulo dela no livro."}</div>{"\n        "}</div>{"\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap"}}>{"\n            "}
                  <div role={"group"} aria-label={"Era do mapa"} style={{display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center"}}>{"\n              "}
                    <span style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", marginRight: "8px"}}>{"Mapa de"}</span>{"\n              "}
                    {(v.mapEras ?? []).map((m: any, m__i: number) => (<Fragment key={m__i}>{"\n                "}
                      {m.on ? (<>
                        <button aria-pressed={"true"} onClick={m.go} style={{background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "8px 12px", fontFamily: "'Poiret One',sans-serif", fontSize: "18px", fontWeight: "600", letterSpacing: "0.06em", lineHeight: "1", cursor: "pointer"}}>{m.e}</button></>) : null}{"\n                "}
                      {m.off ? (<>
                        <button aria-pressed={"false"} onClick={m.go} style={{background: "none", color: "var(--sv-dim,#9b9488)", border: "1px solid var(--sv-line2,#3a3631)", padding: "7px 11px", fontFamily: "'Poiret One',sans-serif", fontSize: "18px", letterSpacing: "0.06em", lineHeight: "1", cursor: "pointer"}} className="svh-24">{m.e}</button></>) : null}{"\n              "}</Fragment>))}{"\n            "}</div>{"\n            "}
                  <div style={{display: "flex", gap: "4px"}}>{"\n              "}
                    <button onClick={v.mapZoomIn} aria-label={"Aproximar"} style={{width: "40px", height: "40px", background: "none", border: "1px solid var(--sv-ink,#ebe5d6)", color: "var(--sv-ink,#ebe5d6)", fontSize: "20px", lineHeight: "1", cursor: "pointer"}} className="svh-25">{"+"}</button>{"\n              "}
                    <button onClick={v.mapZoomOut} aria-label={"Afastar"} style={{width: "40px", height: "40px", background: "none", border: "1px solid var(--sv-ink,#ebe5d6)", color: "var(--sv-ink,#ebe5d6)", fontSize: "20px", lineHeight: "1", cursor: "pointer"}} className="svh-26">{"−"}</button>{"\n              "}
                    <button onClick={v.mapReset} style={{height: "40px", background: "none", border: "1px solid var(--sv-ink,#ebe5d6)", color: "var(--sv-ink,#ebe5d6)", padding: "0 14px", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"}} className="svh-27">{"Cidade inteira"}</button>{"\n            "}</div>{"\n          "}</div>{"\n          "}
                <div ref={v.mapVpRef} onPointerDown={v.onMapDown} onPointerMove={v.onMapMove} onPointerUp={v.onMapUp} onPointerCancel={v.onMapUp} aria-label={`Mapa de Saint Village em ${v.mapEraLabel}`} style={{position: "relative", height: "clamp(380px,72vh,760px)", overflow: "hidden", background: "radial-gradient(ellipse at 60% 35%,#141311 0%,#070707 70%)", border: "1px solid var(--sv-line2,#3a3631)", cursor: "grab", touchAction: "none", userSelect: "none", WebkitUserSelect: "none"}}>{"\n            "}
                  <div ref={v.mapInRef} style={{position: "absolute", left: "0", top: "0", width: `${v.mapW}%`, aspectRatio: "1 / 1", transform: v.mapTf}}>{"\n              "}
                    <img src={"/assets/map.svg"} alt={""} draggable={false} style={{position: "absolute", inset: "0", width: "100%", height: "100%", opacity: "0.8", pointerEvents: "none"}} />{"\n              "}
                    {v.mapShowStreets ? (<>{"\n                "}
                      {(v.mapStreets ?? []).map((r: any, r__i: number) => (<Fragment key={r__i}>{"\n                  "}
                        <div style={{position: "absolute", left: `${r.x}%`, top: `${r.y}%`, transform: `translate(-50%,-50%) rotate(${r.rot}deg)`, fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "12px", letterSpacing: "0.06em", color: "#cfc9bc", whiteSpace: "nowrap", pointerEvents: "none", textShadow: "0 0 3px #070707,0 0 3px #070707,0 0 6px #070707"}}>{r.n}</div>{"\n                "}</Fragment>))}{"\n              "}</>) : null}{"\n              "}
                    {(v.mapRegions ?? []).map((r: any, r__i: number) => (<Fragment key={r__i}>{"\n                "}
                      {r.ghost ? (<>{"\n                  "}
                        <div style={{position: "absolute", left: `${r.x}%`, top: `${r.y}%`, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", pointerEvents: "none", textAlign: "center", textShadow: "0 0 4px #070707,0 0 4px #070707"}}>{"\n                    "}
                          <span style={{fontFamily: "'Bebas Neue',sans-serif", fontSize: "16px", letterSpacing: "0.08em", color: "#8f8a80", whiteSpace: "nowrap", textTransform: "uppercase"}}>{r.n}</span>{"\n                    "}
                          <span style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "11px", color: "#8f8a80", whiteSpace: "nowrap"}}>{r.t}</span>{"\n                  "}</div>{"\n                "}</>) : null}{"\n                "}
                      {r.real ? (<>{"\n                  "}
                        <button data-maplabel={"1"} onClick={r.pick} style={{position: "absolute", left: `${r.x}%`, top: `${r.y}%`, transform: "translate(-50%,-50%)", background: r.bg, color: r.fg, border: `1px solid ${r.bd}`, padding: "5px 9px 4px", fontFamily: "'Bebas Neue',sans-serif", fontSize: "19px", letterSpacing: "0.06em", lineHeight: "1", whiteSpace: "nowrap", cursor: "pointer", textTransform: "uppercase", zIndex: "2"}}>{r.n}</button>{"\n                "}</>) : null}{"\n              "}</Fragment>))}{"\n              "}
                    {v.mapShowPlaces ? (<>{"\n                "}
                      {(v.mapPlaces ?? []).map((p: any, p__i: number) => (<Fragment key={p__i}>{"\n                  "}
                        <div style={{position: "absolute", left: `${p.x}%`, top: `${p.y}%`, pointerEvents: "none", zIndex: "1"}}>{"\n                    "}
                          <div style={{position: "absolute", left: "-5px", top: "-5px", width: "10px", height: "10px", borderRadius: "50%", background: "var(--sv-accent,#b0281f)", border: "1.5px solid #f2efe8"}} />{"\n                    "}
                          <div style={{position: "absolute", left: "9px", top: "-8px", fontSize: "12px", letterSpacing: "0.05em", color: "#f2efe8", whiteSpace: "nowrap", textShadow: "0 0 3px #070707,0 0 3px #070707,0 0 6px #070707"}}>{p.n}</div>{"\n                  "}</div>{"\n                "}</Fragment>))}{"\n              "}</>) : null}{"\n            "}</div>{"\n            "}
                  <div style={{position: "absolute", left: "12px", bottom: "12px", fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", color: "#cfc9bc", background: "rgba(7,7,7,0.85)", padding: "8px 14px", pointerEvents: "none", maxWidth: "calc(100% - 24px)"}}>{"Arraste para andar · roda ou + − para aproximar · ruas e lugares aparecem de perto"}</div>{"\n          "}</div>{"\n\n          "}
                {v.mapHasSel ? (<>{"\n            "}
                  <div style={{background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: "16px"}}>{"\n              "}
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", borderBottom: "3px solid var(--sv-bg,#0b0a09)", paddingBottom: "12px"}}>{"\n                "}
                      <div style={{display: "flex", alignItems: "center", gap: "12px 16px", flexWrap: "wrap"}}>{"\n                  "}
                        <div style={{fontFamily: "var(--sv-display,'Bebas Neue',sans-serif)", fontSize: "36px", lineHeight: "1", textTransform: "uppercase"}}>{v.mapSelNome}</div>{"\n                  "}
                        <div style={{border: "2px solid var(--sv-accent,#b0281f)", color: "var(--sv-accent,#b0281f)", padding: "3px 9px", fontFamily: "'Poiret One',sans-serif", fontSize: "18px", fontWeight: "600", transform: "rotate(-2deg)"}}>{v.mapEraLabel}</div>{"\n                "}</div>{"\n                "}
                      <button onClick={v.mapSelClose} aria-label={"Fechar"} style={{background: "none", border: "none", color: "var(--sv-paperdim,#5a554d)", cursor: "pointer", padding: "4px 8px", fontSize: "22px", lineHeight: "1", minWidth: "32px", minHeight: "32px"}}>{"×"}</button>{"\n              "}</div>{"\n              "}
                    {v.mapSelHasDono ? (<>
                      <div style={{fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase"}}>{v.mapSelDono}</div></>) : null}{"\n              "}
                    <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", lineHeight: "1.6", textWrap: "pretty"}}>{v.mapSelResumo}</div>{"\n              "}
                    {v.mapSelHasLugares ? (<>{"\n                "}
                      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,260px),1fr))", gap: "8px 24px", borderTop: "1px solid var(--sv-bg,#0b0a09)", paddingTop: "12px"}}>{"\n                  "}
                        {(v.mapSelLugares ?? []).map((l: any, l__i: number) => (<Fragment key={l__i}>
                          <div style={{fontSize: "13px", lineHeight: "1.45"}}>
                            <span style={{fontWeight: "600", letterSpacing: "0.04em"}}>{l.n}</span>
                            <span style={{color: "var(--sv-paperdim,#5a554d)"}}>{" · "}{l.d}</span></div></Fragment>))}{"\n                "}</div>{"\n              "}</>) : null}{"\n              "}
                    {v.mapSelHasCamadas ? (<>{"\n                "}
                      <div style={{display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid var(--sv-bg,#0b0a09)", paddingTop: "12px"}}>{"\n                  "}
                        <div style={{fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{"A mesma rua em outras décadas"}</div>{"\n                  "}
                        {(v.mapSelCamadas ?? []).map((c: any, c__i: number) => (<Fragment key={c__i}>{"\n                    "}
                          {c.on ? (<>
                            <div style={{display: "grid", gridTemplateColumns: "48px 1fr", gap: "12px", fontSize: "14px", lineHeight: "1.45", fontWeight: "600"}}>
                              <span style={{color: "var(--sv-accent,#b0281f)"}}>{c.y}</span>
                              <span style={{fontFamily: "var(--sv-type,'Special Elite',monospace)"}}>{c.t}</span></div></>) : null}{"\n                    "}
                          {c.off ? (<>
                            <div style={{display: "grid", gridTemplateColumns: "48px 1fr", gap: "12px", fontSize: "14px", lineHeight: "1.45", color: "var(--sv-paperdim,#5a554d)"}}>
                              <span>{c.y}</span>
                              <span style={{fontFamily: "var(--sv-type,'Special Elite',monospace)"}}>{c.t}</span></div></>) : null}{"\n                  "}</Fragment>))}{"\n                "}</div>{"\n              "}</>) : null}{"\n              "}
                    {v.mapSelCanGo ? (<>{"\n                "}
                      <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>{"\n                  "}
                        <button onClick={v.mapSelGo} style={{background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 20px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Ir para cá"}</button>{"\n                  "}
                        <button onClick={v.mapSelSet} style={{background: "none", border: "1px solid var(--sv-bg,#0b0a09)", color: "var(--sv-bg,#0b0a09)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Só marcar cena"}</button>{"\n                "}</div>{"\n              "}</>) : null}{"\n              "}
                    {v.mapSelOutra ? (<>
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", color: "var(--sv-paperdim,#5a554d)"}}>{"Este é o mapa de outra era. Para jogar aqui, troque de era no topo."}</div></>) : null}{"\n            "}</div>{"\n          "}</>) : null}{"\n        "}</div>{"\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,340px),1fr))", gap: "2px"}}>{"\n          "}
                {(v.regionView ?? []).map((r: any, r__i: number) => (<Fragment key={r__i}>{"\n            "}
                  <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "22px", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n              "}
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px"}}>{"\n                "}
                      <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "26px", lineHeight: "1.05"}}>{r.nome}</div>{"\n                "}
                      {r.atual ? (<>
                        <div style={{fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", background: "var(--sv-accent,#b0281f)", padding: "3px 7px", whiteSpace: "nowrap"}}>{"Cena atual"}</div></>) : null}{"\n              "}</div>{"\n              "}
                    <div style={{fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sv-accent2,#c8372b)"}}>{r.meta}</div>{"\n              "}
                    <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", lineHeight: "1.55", color: "var(--sv-ink2,#cfc8b8)"}}>{r.resumo}</div>{"\n              "}
                    {r.hasLugares ? (<>{"\n                "}
                      <div style={{display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid var(--sv-line,#2b2824)", paddingTop: "10px"}}>{"\n                  "}
                        {(r.lugares ?? []).map((l: any, l__i: number) => (<Fragment key={l__i}>
                          <div style={{fontSize: "13px", lineHeight: "1.4"}}>
                            <span style={{color: "var(--sv-ink,#ebe5d6)", letterSpacing: "0.05em"}}>{l.n}</span>
                            <span style={{color: "var(--sv-dim2,#8a847a)"}}>{" · "}{l.d}</span></div></Fragment>))}{"\n                "}</div>{"\n              "}</>) : null}{"\n              "}
                    {r.hasGancho ? (<>
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.5", color: "var(--sv-dim,#9b9488)", borderTop: "1px solid var(--sv-line,#2b2824)", paddingTop: "10px"}}>{"Gancho: "}{r.gancho}</div></>) : null}{"\n              "}
                    {r.hasNpcs ? (<>
                      <div style={{fontSize: "12px", letterSpacing: "0.05em", color: "var(--sv-dim,#9b9488)", lineHeight: "1.5"}}>{"Gente: "}{r.npcs}</div></>) : null}{"\n              "}
                    <div style={{flex: "1"}} />{"\n              "}
                    <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>{"\n                "}
                      <button onClick={r.go} style={{background: "var(--sv-ink,#ebe5d6)", color: "var(--sv-bg,#0b0a09)", border: "none", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}} className="svh-28">{"Ir para cá"}</button>{"\n                "}
                      <button onClick={r.set} style={{background: "none", border: "1px solid var(--sv-line2,#3a3631)", color: "var(--sv-dim,#9b9488)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer"}}>{"Só marcar cena"}</button>{"\n              "}</div>{"\n            "}</div>{"\n          "}</Fragment>))}{"\n        "}</div>{"\n      "}</div>{"\n    "}</>) : null}{"\n\n    "}
          {v.tabSeculo ? (<>{"\n      "}
            <div style={{display: "flex", flexDirection: "column", gap: "40px"}}>{"\n        "}
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px"}}>{"\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "12px", maxWidth: "640px"}}>{"\n            "}
                  <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "40px", textTransform: "uppercase", lineHeight: "1", color: "var(--sv-title,inherit)"}}>{"O Século · 1792–1999"}</div>{"\n            "}
                  <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", lineHeight: "1.6", color: "var(--sv-ink2,#cfc8b8)", textWrap: "pretty"}}>{"Saint Village XX Century, Edição Omni. Nada some nesta cidade; fica por baixo. A cronologia, as famílias, as Testemunhas e o cânone que costura os livros. O narrador lê tudo isto em toda resposta, e nunca conta o futuro."}</div>{"\n          "}</div>{"\n          "}
                <button onClick={v.toggleFuturo} style={{background: "none", border: "1px solid var(--sv-line2,#3a3631)", color: "var(--sv-dim,#9b9488)", padding: "10px 16px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer"}} className="svh-29">{v.futuroLabel}</button>{"\n        "}</div>{"\n\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))", gap: "2px"}}>{"\n          "}
                {(v.seculoEras ?? []).map((e: any, e__i: number) => (<Fragment key={e__i}>{"\n            "}
                  {e.atual ? (<>
                    <div style={{background: "var(--sv-hicard,var(--sv-paper,#e9e3d3))", color: "var(--sv-bg,#0b0a09)", padding: "18px", display: "flex", flexDirection: "column", gap: "8px"}}>
                      <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "38px", lineHeight: "1"}}>{e.e}</div>
                      <div style={{fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase"}}>{e.g}</div>
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.45"}}>{e.q}</div></div></>) : null}{"\n            "}
                  {e.outra ? (<>
                    <div onClick={e.go} style={{cursor: "pointer", background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "8px"}} className="svh-30">
                      <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "38px", lineHeight: "1", color: "var(--sv-accent2,#c8372b)"}}>{e.e}</div>
                      <div style={{fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)"}}>{e.g}</div>
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.45", color: "var(--sv-ink2,#cfc8b8)"}}>{e.q}</div></div></>) : null}{"\n          "}</Fragment>))}{"\n        "}</div>{"\n\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "32px", alignItems: "start"}}>{"\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "12px", minWidth: "0"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"Cronologia · "}{v.cronoLabel}</div>{"\n            "}
                  <div style={{maxHeight: "560px", overflowY: "auto", display: "flex", flexDirection: "column"}}>{"\n              "}
                    {(v.cronoView ?? []).map((c: any, c__i: number) => (<Fragment key={c__i}>{"\n                "}
                      <div style={{display: "grid", gridTemplateColumns: "64px 1fr", gap: "12px", padding: "9px 0", borderBottom: "1px solid var(--sv-line3,#1e1c19)"}}>{"\n                  "}
                        <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "19px", color: "var(--sv-accent2,#c8372b)"}}>{c.a}</div>{"\n                  "}
                        <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "14px", lineHeight: "1.5", color: "var(--sv-ink2,#cfc8b8)"}}>{c.t}</div>{"\n                "}</div>{"\n              "}</Fragment>))}{"\n            "}</div>{"\n          "}</div>{"\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "12px", minWidth: "0"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"Testemunhas do Século"}</div>{"\n            "}
                  <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.55", color: "var(--sv-dim,#9b9488)"}}>{"Cada uma guarda uma pista central de outra era. Entrega de graça a quem tem Laço com a era certa; sem o Laço, custa 2 de História da Cidade."}</div>{"\n            "}
                  {(v.testemunhasView ?? []).map((t: any, t__i: number) => (<Fragment key={t__i}>{"\n              "}
                    <div style={{display: "flex", flexDirection: "column", gap: "4px", padding: "10px 0", borderBottom: "1px solid var(--sv-line3,#1e1c19)"}}>{"\n                "}
                      <div style={{display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap"}}>
                        <span style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "18px"}}>{t.n}</span>
                        <span style={{fontSize: "12px", letterSpacing: "0.15em", color: "var(--sv-accent2,#c8372b)"}}>{t.vida}</span></div>{"\n                "}
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.5", color: "var(--sv-ink2,#cfc8b8)"}}>{"Viu: "}{t.viu}{" · Carrega: "}{t.carrega}</div>{"\n              "}</div>{"\n            "}</Fragment>))}{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"As famílias · quem carrega cada nome, com a idade naquele ano"}</div>{"\n          "}
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,360px),1fr))", gap: "2px"}}>{"\n            "}
                  {(v.linhagensView ?? []).map((l: any, l__i: number) => (<Fragment key={l__i}>{"\n              "}
                    <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "16px", display: "flex", flexDirection: "column", gap: "8px"}}>{"\n                "}
                      <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "22px", lineHeight: "1.1"}}>{l.fam}</div>{"\n                "}
                      {(l.cols ?? []).map((c: any, c__i: number) => (<Fragment key={c__i}>
                        <div style={{display: "grid", gridTemplateColumns: "44px 1fr", gap: "12px", fontSize: "13px", lineHeight: "1.45"}}>
                          <span style={{color: "var(--sv-accent2,#c8372b)", letterSpacing: "0.05em"}}>{c.y}</span>
                          <span style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", color: "var(--sv-ink2,#cfc8b8)"}}>{c.t}</span></div></Fragment>))}{"\n              "}</div>{"\n            "}</Fragment>))}{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"A cidade em camadas · o rosto de cada região em cada era"}</div>{"\n          "}
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))", gap: "2px"}}>{"\n            "}
                  {(v.camadasView ?? []).map((r: any, r__i: number) => (<Fragment key={r__i}>{"\n              "}
                    <div style={{border: "1px solid var(--sv-line,#2b2824)", padding: "16px", display: "flex", flexDirection: "column", gap: "8px"}}>{"\n                "}
                      <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "20px", lineHeight: "1.1"}}>{r.k}</div>{"\n                "}
                      {(r.cols ?? []).map((c: any, c__i: number) => (<Fragment key={c__i}>
                        <div style={{display: "grid", gridTemplateColumns: "44px 1fr", gap: "12px", fontSize: "13px", lineHeight: "1.45"}}>
                          <span style={{color: "var(--sv-accent2,#c8372b)"}}>{c.y}</span>
                          <span style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", color: "var(--sv-ink2,#cfc8b8)"}}>{c.t}</span></div></Fragment>))}{"\n              "}</div>{"\n            "}</Fragment>))}{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"As âncoras do século · lugares que existem em todas as eras"}</div>{"\n          "}
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))", gap: "12px 28px"}}>{"\n            "}
                  {(v.ancorasView ?? []).map((a: any, a__i: number) => (<Fragment key={a__i}>
                    <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                      <div style={{fontSize: "14px", letterSpacing: "0.12em", textTransform: "uppercase"}}>{a.n}</div>
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.5", color: "var(--sv-ink2,#cfc8b8)"}}>{a.t}</div></div></Fragment>))}{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              {v.hasDestinos ? (<>{"\n          "}
                <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"O que aconteceu com eles · destinos de cânone (a sua mesa vence)"}</div>{"\n            "}
                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,340px),1fr))", gap: "12px 28px"}}>{"\n              "}
                    {(v.destinosView ?? []).map((a: any, a__i: number) => (<Fragment key={a__i}>
                      <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                        <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "18px"}}>{a.n}</div>
                        <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.55", color: "var(--sv-ink2,#cfc8b8)"}}>{a.t}</div></div></Fragment>))}{"\n            "}</div>{"\n          "}</div>{"\n        "}</>) : null}{"\n\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"As vozes que faltavam · em cada caso, uma comunidade tem interesse próprio no resultado"}</div>{"\n          "}
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,420px),1fr))", gap: "2px"}}>{"\n            "}
                  {(v.vozesView ?? []).map((v: any, v__i: number) => (<Fragment key={v__i}>
                    <div style={{background: "var(--sv-panel,#141210)", border: "1px solid var(--sv-line,#2b2824)", padding: "18px", display: "flex", flexDirection: "column", gap: "8px"}}>
                      <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "20px", lineHeight: "1.15"}}>{v.n}</div>
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.6", color: "var(--sv-ink2,#cfc8b8)", textWrap: "pretty"}}>{v.t}</div></div></Fragment>))}{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--sv-dim,#9b9488)", borderBottom: "1px solid var(--sv-line,#2b2824)", paddingBottom: "8px"}}>{"Intermezzos · casos de uma sessão nos anos em que a cidade mudou de rosto"}</div>{"\n          "}
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,260px),1fr))", gap: "2px"}}>{"\n            "}
                  {(v.intermezzosView ?? []).map((i: any, i__i: number) => (<Fragment key={i__i}>{"\n              "}
                    <div style={{background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", padding: "18px", display: "flex", flexDirection: "column", gap: "8px"}}>{"\n                "}
                      <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "34px", lineHeight: "1", color: "var(--sv-accent,#b0281f)"}}>{i.ano}</div>{"\n                "}
                      <div style={{fontSize: "14px", letterSpacing: "0.15em", textTransform: "uppercase"}}>{i.titulo}</div>{"\n                "}
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: "5", WebkitBoxOrient: "vertical", overflow: "hidden"}}>{i.premissa}</div>{"\n                "}
                      <div style={{flex: "1"}} />{"\n                "}
                      <button onClick={i.go} style={{alignSelf: "flex-start", background: "var(--sv-bg,#0b0a09)", color: "var(--sv-ink,#ebe5d6)", border: "none", padding: "10px 14px", fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer"}}>{i.btn}</button>{"\n              "}</div>{"\n            "}</Fragment>))}{"\n          "}</div>{"\n        "}</div>{"\n\n        "}
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "32px", alignItems: "start"}}>{"\n          "}
                <div style={{background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase", borderBottom: "3px solid var(--sv-bg,#0b0a09)", paddingBottom: "10px"}}>{"As Regras do Século"}</div>{"\n            "}
                  {(v.seculoRegras ?? []).map((rg: any, rg__i: number) => (<Fragment key={rg__i}>{"\n              "}
                    <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>{"\n                "}
                      <div style={{fontSize: "12px", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--sv-accent,#b0281f)"}}>{rg.h}</div>{"\n                "}
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13.5px", lineHeight: "1.6", textWrap: "pretty"}}>{rg.b}</div>{"\n              "}</div>{"\n            "}</Fragment>))}{"\n          "}</div>{"\n          "}
                <div style={{border: "1px solid var(--sv-line2,#3a3631)", padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n            "}
                  <div style={{fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--sv-accent2,#c8372b)", borderBottom: "1px solid var(--sv-line2,#3a3631)", paddingBottom: "10px"}}>{"Continuidade · o cânone do século"}</div>{"\n            "}
                  {(v.canoneView ?? []).map((cn: any, cn__i: number) => (<Fragment key={cn__i}>
                    <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13.5px", lineHeight: "1.6", color: "var(--sv-ink2,#cfc8b8)", paddingLeft: "14px", borderLeft: "1px solid var(--sv-line2,#3a3631)"}}>{cn.t}</div></Fragment>))}{"\n          "}</div>{"\n        "}</div>{"\n      "}</div>{"\n    "}</>) : null}{"\n\n    "}
          {v.tabTutorial ? (<>{"\n      "}
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "40px", alignItems: "start"}}>{"\n        "}
              <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>{"\n          "}
                <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontSize: "40px", textTransform: "uppercase", lineHeight: "1", color: "var(--sv-title,inherit)", marginBottom: "16px"}}>{"Como jogar sozinho"}</div>{"\n          "}
                {(v.tutorial ?? []).map((s: any, s__i: number) => (<Fragment key={s__i}>{"\n            "}
                  <div style={{display: "grid", gridTemplateColumns: "56px 1fr", gap: "16px", padding: "16px 0", borderTop: "1px solid var(--sv-line,#2b2824)"}}>{"\n              "}
                    <div style={{fontFamily: "var(--sv-display,'Bodoni Moda',serif)", fontWeight: "900", fontStyle: "italic", fontSize: "40px", lineHeight: "0.9", color: "var(--sv-accent2,#c8372b)"}}>{s.n}</div>{"\n              "}
                    <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>{"\n                "}
                      <div style={{fontSize: "16px", letterSpacing: "0.2em", textTransform: "uppercase"}}>{s.t}</div>{"\n                "}
                      <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "15px", lineHeight: "1.65", color: "var(--sv-ink2,#cfc8b8)", textWrap: "pretty"}}>{s.d}</div>{"\n              "}</div>{"\n            "}</div>{"\n          "}</Fragment>))}{"\n        "}</div>{"\n        "}
              <div style={{background: "var(--sv-paper,#e9e3d3)", color: "var(--sv-bg,#0b0a09)", padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: "12px"}}>{"\n          "}
                <div style={{fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase", borderBottom: "3px solid var(--sv-bg,#0b0a09)", paddingBottom: "10px"}}>{"Referência rápida · "}{v.eraTitulo}</div>{"\n          "}
                {(v.regrasView ?? []).map((rg: any, rg__i: number) => (<Fragment key={rg__i}>{"\n            "}
                  <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>{"\n              "}
                    <div style={{fontSize: "12px", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--sv-accent,#b0281f)"}}>{rg.h}</div>{"\n              "}
                    <div style={{fontFamily: "var(--sv-type,'Special Elite',monospace)", fontSize: "13.5px", lineHeight: "1.6", textWrap: "pretty"}}>{rg.b}</div>{"\n            "}</div>{"\n          "}</Fragment>))}{"\n        "}</div>{"\n      "}</div>{"\n    "}</>) : null}{"\n\n  "}</div>{"\n"}</>) : null}{"\n"}</div>{"\n"}
    </>
  );
}
