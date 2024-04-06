import React, { useRef, useEffect, useState } from "react";
import {
  Button,
  Box,
  Divider,
  Popper,
  Fade,
  Paper,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PopupState, { bindToggle, bindPopper } from "material-ui-popup-state";
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import TitleIcon from "@mui/icons-material/Title";
import AddIcon from "@mui/icons-material/Add";
import { useDebounce } from "./hooks/useDebounce";
import { data } from "./data";
import axios from "axios";

const StickyBottomBar = ({ heading, onAddCitation }) => {
  const searchRef = useRef(null);
  const [search, setSearch] = useState(heading);
  const debouncedSearch = useDebounce(search);
  const [suggestions, setSuggestions] = useState([]);
  const [citationStyle, setCitationStyle] = useState("");

  useEffect(() => {
    const val = searchRef.current?.value;
    if (val === "") {
      setSearch(heading);
    }
  }, [searchRef.current?.value]);

  useEffect(() => {
    const getSuggestions = async () => {
      if (debouncedSearch !== "")
        axios
          .post("https://api.gyanibooks.com/search_publication/", {
            keyword: debouncedSearch,
            limit: 10,
          })
          .then((res) => {
            // console.log("App -> useEffect ", res.data);

            // api error is returned in response object
            if (!res.data.hasOwnProperty("error"))
              setSuggestions(res.data.data);
          })
          .catch((err) => {
            console.error(err);
          });
    };

    if (debouncedSearch === "") {
      const resSuggestions = data.filter((article) =>
        article.title.includes(heading)
      ); //debouncedSearch
      setSuggestions(resSuggestions);

      // getSuggestions(heading);
    } else {
      const resSuggestions = data.filter((article) =>
        article.title.includes("climate")
      ); //debouncedSearch
      setSuggestions(resSuggestions);

      // getSuggestions(debouncedSearch);
      // console.log("dsearch", debouncedSearch, "result", resSuggestions);
    }
    // resSuggestions.splice(10);
  }, [data, heading, debouncedSearch]);

  // useEffect(() => {
  //   console.log("suggestions", suggestions);
  // }, [suggestions]);

  const handleCitationStyleChange = (e) => {
    setCitationStyle(e.target.value);
  };

  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        zIndex: 1,
        background: "#fff",
      }}
    >
      <Box display={"flex"}>
        <Button
          variant="text"
          color="primary"
          sx={{ textTransform: "none" }}
          startIcon={<AutoFixNormalIcon />}
        >
          AI Commands
        </Button>
        <Divider
          orientation="vertical"
          flexItem
          textAlign="center"
          sx={{ borderRightWidth: 1, height: "20px", mx: 1, my: 1 }}
        />
        <PopupState variant="popper">
          {(popupState) => (
            <div>
              <Button
                variant="text"
                color="primary"
                sx={{ textTransform: "none", p: 1 }}
                startIcon={<AutoStoriesIcon />}
                {...bindToggle(popupState)}
              >
                Cite
              </Button>
              <Popper {...bindPopper(popupState)} transition>
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <Paper>
                      <Box
                        sx={{
                          p: 1,
                          width: "400px",
                          height: "350px",
                        }}
                      >
                        <Box display="flex" gap={1}>
                          <Box display="flex" width={"100%"}>
                            <SearchIcon sx={{ color: "action.active" }} />
                            <TextField
                              ref={searchRef}
                              variant="standard"
                              placeholder="search citations..."
                              defaultValue={search}
                              onChange={(e) => setSearch(e.target.value)}
                              fullWidth
                            />
                          </Box>
                          <Box sx={{ pt: "3px", pr: 1, m: 0 }}>
                            <FormControl size="small" sx={{ minWidth: "85px" }}>
                              <Select
                                variant="standard"
                                label="Citation Style"
                                value={citationStyle}
                                onChange={handleCitationStyleChange}
                              >
                                <MenuItem value="mla">MLA</MenuItem>
                                <MenuItem value="apa">APA</MenuItem>
                                <MenuItem value="chicago">Chicago</MenuItem>
                                <MenuItem value="harvard">Harvard</MenuItem>
                                <MenuItem value="ieee">IEEE</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>
                        <Divider sx={{ mt: 1, width: "100%" }} />
                        <Box overflow={"auto"} maxHeight={"300px"}>
                          {suggestions &&
                            suggestions.map((suggestion, _) => (
                              <SuggestionCard
                                key={_}
                                suggestion={suggestion}
                                onAddCitation={(bibtex, url) =>
                                  onAddCitation(bibtex, url, citationStyle)
                                }
                              />
                            ))}
                        </Box>
                      </Box>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </div>
          )}
        </PopupState>
        <Divider
          orientation="vertical"
          flexItem
          textAlign="center"
          sx={{ borderRightWidth: 1, height: "20px", mx: 1, my: 1 }}
        />
        <Button
          variant="text"
          color="primary"
          sx={{ textTransform: "none" }}
          startIcon={<TitleIcon />}
          endIcon={<ArrowDropUpIcon />}
        >
          Text
        </Button>
      </Box>
    </Box>
  );
};

export default StickyBottomBar;

const SuggestionCard = ({ suggestion, onAddCitation }) => {
  const {
    url,
    title,
    authors,
    abstract,
    citationStyles: { bibtex },
  } = suggestion;
  const bl = bibtex.length;
  const authorsL =
    authors
      .slice(0, 3)
      .map((author) => author.name)
      .join(", ") + ", ";

  return (
    <Card
      sx={{
        width: "395px",
        minHeight: "100px",
        borderRadius: "0px",
        pt: "4px",
        pb: 1,
        ":hover": { bgcolor: "#f6f6f6" },
      }}
    >
      <CardContent
        sx={{
          py: 0,
          px: 1,
          ":last-child": { pb: 2 },
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: "bold" }}>
          {/* {title.split(" ").slice(0, 5).join(" ")} */}
          {title.length > 100 ? title.substring(0, 100) + "..." : title}
        </Typography>
        <Typography sx={{ fontSize: 12 }}>
          {authorsL.length > 40 ? authorsL.substring(0, 40) + "..." : authorsL}
        </Typography>
        <Typography
          sx={{ fontSize: 12, fontStyle: "italic" }}
          color="text.secondary"
        >
          {bibtex.substring(bl - 8, bl - 4)}
        </Typography>
        {abstract ? (
          <Typography
            sx={{
              fontSize: 12,
              border: "1px solid #e4e4e4",
              borderRadius: "4px",
              p: "4px",
            }}
          >
            {"..., " + abstract.split(" ").slice(10, 30).join(" ") + " ..."}
          </Typography>
        ) : (
          ""
        )}
      </CardContent>
      <CardActions sx={{ p: 0, m: 0, display: "flex", gap: 1 }}>
        <Button
          variant="text"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => onAddCitation(bibtex, url)}
          sx={{
            fontSize: "12px",
            textTransform: "none",
            "&:hover": {
              textDecoration: "underline",
              bgcolor: "transparent",
            },
          }}
        >
          Add Citation
        </Button>
        <Button
          variant="text"
          color="primary"
          startIcon={<OpenInNewIcon />}
          // onClick={handleOpenInNew}
          sx={{
            fontSize: "12px",
            textTransform: "none",
            "&:hover": {
              textDecoration: "underline",
              bgcolor: "transparent",
            },
          }}
        >
          View in new tab
        </Button>
      </CardActions>
    </Card>
  );
};
